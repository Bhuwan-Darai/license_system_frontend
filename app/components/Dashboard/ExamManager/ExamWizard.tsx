"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { usePageCrumb } from "@/app/context/BreadcrumbContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import {
  ExamBank,
  ExamPayload,
  useMutationExam,
  useQueryBankQuestions,
  useQueryExam,
  useQueryExamBanks,
} from "./useExam";

const { Title, Text } = Typography;

type PickedQuestion = {
  question_id: string;
  bank_id: string;
  title: string;
  marks: number;
};

type ExamFormValues = {
  title: string;
  description?: string;
  duration: number;
  pass_marks: number;
  is_visible: boolean;
};

const difficultyColor = (level: string) =>
  level === "EASY"
    ? "green"
    : level === "MEDIUM"
      ? "blue"
      : level === "HARD"
        ? "orange"
        : "red";

const STEPS = [
  { title: "Exam Details", description: "Basic information" },
  { title: "Question Sets", description: "Choose question sets" },
  { title: "Questions", description: "Select questions" },
  { title: "Review", description: "Review and save" },
];

type Props = {
  /** null creates a new exam, an id edits that exam */
  examId: string | null;
  onClose: () => void;
};

export default function ExamWizard({ examId, onClose }: Props) {
  const isEdit = !!examId;
  const { isAllowed } = useAuthContext();
  const canSave = isAllowed(isEdit ? PERM.EXAM.UPDATE : PERM.EXAM.ADD);
  const canVisibility = isAllowed(PERM.EXAM.VISIBILITY);
  const [form] = Form.useForm<ExamFormValues>();
  const [current, setCurrent] = useState(0);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [picked, setPicked] = useState<PickedQuestion[]>([]);

  usePageCrumb(isEdit ? "Edit Exam" : "Create Exam", onClose);

  const { data: banks = [], isLoading: isBanksLoading } = useQueryExamBanks();
  const { data: exam, isLoading: isExamLoading } = useQueryExam(examId);
  const { createExam, updateExam, isCreating, isUpdating } = useMutationExam();

  // Fill the wizard once from the exam being edited
  const hydrated = useRef(false);
  useEffect(() => {
    if (!exam || hydrated.current) return;
    hydrated.current = true;
    form.setFieldsValue({
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      pass_marks: exam.pass_marks,
      is_visible: exam.is_visible,
    });
    setPicked(
      exam.questions.map((q) => ({
        question_id: q.question_id,
        bank_id: q.question_bank_id,
        title: q.question?.title ?? "(question unavailable)",
        marks: q.marks,
      })),
    );
    setSelectedBankIds([...new Set(exam.questions.map((q) => q.question_bank_id))]);
  }, [exam, form]);

  const totalMarks = picked.reduce((sum, q) => sum + q.marks, 0);

  const toggleBank = (bankId: string, checked: boolean) => {
    setSelectedBankIds((ids) =>
      checked ? [...ids, bankId] : ids.filter((id) => id !== bankId),
    );
    if (!checked) {
      // Questions of a deselected set cannot stay in the exam
      setPicked((list) => list.filter((q) => q.bank_id !== bankId));
    }
  };

  const setBankPicks = (bankId: string, next: PickedQuestion[]) => {
    setPicked((list) => [...list.filter((q) => q.bank_id !== bankId), ...next]);
  };

  const move = (index: number, delta: number) => {
    setPicked((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const next = async () => {
    if (current === 0) {
      try {
        await form.validateFields(["title", "duration"]);
      } catch {
        return;
      }
    }
    if (current === 1 && selectedBankIds.length === 0) {
      message.warning("Select at least one question set");
      return;
    }
    if (current === 2 && picked.length === 0) {
      message.warning("Select at least one question");
      return;
    }
    setCurrent((c) => c + 1);
  };

  const submit = async () => {
    // Only the review step's field is mounted here, and validateFields() only
    // returns mounted fields, so validate pass marks and read the rest from the store.
    try {
      await form.validateFields(["pass_marks"]);
    } catch {
      return;
    }
    const values = form.getFieldsValue(true) as ExamFormValues;

    if (!values.title?.trim() || !values.duration) {
      message.error("Title and duration are required. Go back to Exam Details.");
      setCurrent(0);
      return;
    }

    const payload: ExamPayload = {
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      duration: values.duration,
      pass_marks: values.pass_marks,
      is_visible: values.is_visible ?? true,
      questions: picked.map((q) => ({
        question_id: q.question_id,
        marks: q.marks,
      })),
    };

    try {
      if (examId) await updateExam({ id: examId, payload });
      else await createExam(payload);
      onClose();
    } catch {
      // the mutation hooks already surface the error
    }
  };

  if (!canSave) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  if (isEdit && isExamLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Steps current={current} items={STEPS} />
      </Card>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_visible: true }}
      >
        <Card style={{ minHeight: 400 }}>
          {current === 0 && <ExamDetailsStep canVisibility={canVisibility} />}
          {current === 1 && (
            <QuestionSetsStep
              banks={banks}
              loading={isBanksLoading}
              selected={selectedBankIds}
              picked={picked}
              onToggle={toggleBank}
            />
          )}
          {current === 2 && (
            <QuestionsStep
              banks={banks.filter((b) =>
                selectedBankIds.includes(b["Question Bank Id"]),
              )}
              picked={picked}
              onChange={setBankPicks}
            />
          )}
          {current === 3 && (
            <ReviewStep
              picked={picked}
              banks={banks}
              totalMarks={totalMarks}
              onMarks={(index, marks) =>
                setPicked((list) =>
                  list.map((q, i) => (i === index ? { ...q, marks } : q)),
                )
              }
              onMove={move}
              onRemove={(index) =>
                setPicked((list) => list.filter((_, i) => i !== index))
              }
            />
          )}
        </Card>
      </Form>

      <Card style={{ marginTop: 24 }}>
        <Row justify="space-between">
          <Col>
            <Space>
              <Button onClick={onClose}>Cancel</Button>
              {current > 0 && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  Previous
                </Button>
              )}
            </Space>
          </Col>
          <Col>
            {current < STEPS.length - 1 ? (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                onClick={next}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={isCreating || isUpdating}
                disabled={picked.length === 0}
                onClick={submit}
              >
                {isEdit ? "Save Changes" : "Create Exam"}
              </Button>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
}

/* ----------------------------- Step 1 ----------------------------- */

const ExamDetailsStep: React.FC<{ canVisibility: boolean }> = ({
  canVisibility,
}) => (
  <div>
    <Title level={4}>Exam Details</Title>
    <Text type="secondary">Enter the basic information for the exam.</Text>

    <div style={{ marginTop: 24, maxWidth: 600 }}>
      <Form.Item
        label="Title"
        name="title"
        rules={[
          { required: true, whitespace: true, message: "Please enter a title" },
          { min: 3, message: "Title must be at least 3 characters" },
        ]}
      >
        <Input size="large" placeholder="e.g. Category B – Mock Exam 1" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Optional" />
      </Form.Item>

      <Form.Item
        label="Duration (minutes)"
        name="duration"
        rules={[
          { required: true, message: "Please enter the duration" },
          {
            type: "number",
            min: 1,
            max: 180,
            message: "Duration must be between 1 and 180 minutes",
          },
        ]}
      >
        <InputNumber size="large" min={1} max={180} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Visible to users"
        name="is_visible"
        valuePropName="checked"
      >
        <Switch
          checkedChildren="Shown"
          unCheckedChildren="Hidden"
          disabled={!canVisibility}
        />
      </Form.Item>
    </div>
  </div>
);

/* ----------------------------- Step 2 ----------------------------- */

const QuestionSetsStep: React.FC<{
  banks: ExamBank[];
  loading: boolean;
  selected: string[];
  picked: PickedQuestion[];
  onToggle: (bankId: string, checked: boolean) => void;
}> = ({ banks, loading, selected, picked, onToggle }) => (
  <div>
    <Title level={4}>Question Sets</Title>
    <Text type="secondary">
      Select the question sets to draw questions from. You can pick several.
    </Text>

    <Spin spinning={loading}>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {banks.map((bank) => {
          const id = bank["Question Bank Id"];
          const checked = selected.includes(id);
          const pickedCount = picked.filter((q) => q.bank_id === id).length;
          return (
            <Col xs={24} sm={12} lg={8} key={id}>
              <Card
                hoverable
                size="small"
                onClick={() => onToggle(id, !checked)}
                style={{ borderColor: checked ? "#1677ff" : undefined }}
              >
                <Space align="start">
                  <Checkbox checked={checked} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{bank.Title}</div>
                    <Tag color="blue" style={{ marginTop: 4 }}>
                      {bank.Category?.title}
                    </Tag>
                    {checked && pickedCount > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">
                          {pickedCount} question{pickedCount > 1 ? "s" : ""}{" "}
                          selected
                        </Text>
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
      {!loading && banks.length === 0 && (
        <Empty description="No question sets yet. Create one in Question Bank." />
      )}
    </Spin>
  </div>
);

/* ----------------------------- Step 3 ----------------------------- */

const BankQuestions: React.FC<{
  bank: ExamBank;
  picked: PickedQuestion[];
  onChange: (bankId: string, next: PickedQuestion[]) => void;
}> = ({ bank, picked, onChange }) => {
  const bankId = bank["Question Bank Id"];
  const { data: questions = [], isLoading } = useQueryBankQuestions(
    bankId,
    true,
  );

  const mine = picked.filter((q) => q.bank_id === bankId);
  const isPicked = (id: string) => mine.some((q) => q.question_id === id);
  const selectable = questions.filter((q) => q.is_active);

  const toPicked = (q: (typeof questions)[number]): PickedQuestion => ({
    question_id: q.question_id,
    bank_id: bankId,
    title: q.title,
    marks: 1,
  });

  const toggle = (q: (typeof questions)[number], checked: boolean) =>
    onChange(
      bankId,
      checked ? [...mine, toPicked(q)] : mine.filter((p) => p.question_id !== q.question_id),
    );

  // keep marks already chosen for questions that stay selected
  const selectAll = () =>
    onChange(
      bankId,
      selectable.map((q) => mine.find((p) => p.question_id === q.question_id) ?? toPicked(q)),
    );

  return (
    <Spin spinning={isLoading}>
      <Space style={{ marginBottom: 12 }}>
        <Button size="small" onClick={selectAll}>
          Select all
        </Button>
        <Button size="small" onClick={() => onChange(bankId, [])}>
          Clear
        </Button>
        <Text type="secondary">
          {mine.length} of {selectable.length} selected
        </Text>
      </Space>
      <List
        dataSource={questions}
        locale={{ emptyText: "This set has no questions yet" }}
        renderItem={(q) => (
          <List.Item>
            <Checkbox
              checked={isPicked(q.question_id)}
              disabled={!q.is_active}
              onChange={(e) => toggle(q, e.target.checked)}
              style={{ width: "100%" }}
            >
              <Space wrap>
                <span>{q.title}</span>
                <Tag color={difficultyColor(q.difficulty_level)}>
                  {q.difficulty_level}
                </Tag>
                {!q.is_active && <Tag>Inactive</Tag>}
              </Space>
            </Checkbox>
          </List.Item>
        )}
      />
    </Spin>
  );
};

const QuestionsStep: React.FC<{
  banks: ExamBank[];
  picked: PickedQuestion[];
  onChange: (bankId: string, next: PickedQuestion[]) => void;
}> = ({ banks, picked, onChange }) => (
  <div>
    <Title level={4}>Select Questions</Title>
    <Text type="secondary">
      Select individual questions from each question set.
    </Text>

    <Tabs
      style={{ marginTop: 16 }}
      items={banks.map((bank) => {
        const id = bank["Question Bank Id"];
        const count = picked.filter((q) => q.bank_id === id).length;
        return {
          key: id,
          label: `${bank.Title} (${count})`,
          children: (
            <BankQuestions bank={bank} picked={picked} onChange={onChange} />
          ),
        };
      })}
    />
  </div>
);

/* ----------------------------- Step 4 ----------------------------- */

const ReviewStep: React.FC<{
  picked: PickedQuestion[];
  banks: ExamBank[];
  totalMarks: number;
  onMarks: (index: number, marks: number) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}> = ({ picked, banks, totalMarks, onMarks, onMove, onRemove }) => {
  const bankTitle = (id: string) =>
    banks.find((b) => b["Question Bank Id"] === id)?.Title ?? "Unknown set";

  return (
    <div>
      <Title level={4}>Review Exam</Title>
      <Text type="secondary">
        Adjust the order and marks, then save. Removing a question here only
        removes it from this exam.
      </Text>

      <Row gutter={24} style={{ margin: "24px 0" }} align="bottom">
        <Col>
          <Statistic title="Questions" value={picked.length} />
        </Col>
        <Col>
          <Statistic title="Total marks" value={totalMarks} />
        </Col>
        <Col>
          <Form.Item
            label="Pass marks"
            name="pass_marks"
            style={{ marginBottom: 0 }}
           
            rules={[
              { required: true, message: "Enter the pass marks" },
              () => ({
                validator(_, value) {
                  if (value && value > totalMarks) {
                    return Promise.reject(
                      new Error(`Cannot exceed total marks (${totalMarks})`),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} max={Math.max(totalMarks, 1)} />
          </Form.Item>
        </Col>
      </Row>

      {picked.length === 0 && (
        <Alert
          type="warning"
          showIcon
          message="No questions left. Go back and select some."
        />
      )}

      <Table
        size="small"
        pagination={false}
        rowKey="question_id"
        dataSource={picked}
        columns={[
          {
            title: "#",
            width: 50,
            render: (_: unknown, __: PickedQuestion, index: number) => index + 1,
          },
          { title: "Question", dataIndex: "title" },
          {
            title: "Set",
            dataIndex: "bank_id",
            render: (id: string) => <Tag color="blue">{bankTitle(id)}</Tag>,
          },
          {
            title: "Marks",
            dataIndex: "marks",
            width: 110,
            render: (marks: number, _: PickedQuestion, index: number) => (
              <InputNumber
                min={1}
                max={100}
                value={marks}
                onChange={(v) => onMarks(index, v ?? 1)}
              />
            ),
          },
          {
            title: "",
            width: 130,
            render: (_: unknown, __: PickedQuestion, index: number) => (
              <Space>
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === picked.length - 1}
                  onClick={() => onMove(index, 1)}
                />
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(index)}
                />
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};
