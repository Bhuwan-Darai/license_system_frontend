"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import api from "@/app/utils/axios";
import ImageUpload from "@/app/components/ui/UploadImage";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import { DBQuestion } from "./useQuestions";
import {
  useQueryBankQuestions,
  useQueryExamBanks,
} from "../../ExamManager/useExam";

const { Text } = Typography;
const { TextArea } = Input;

const MAX_FORMS_AT_ONCE = 50;
const AUTOSAVE_DELAY_MS = 800;

type Difficulty = "easy" | "medium" | "hard";
type SyncStatus = "draft" | "incomplete" | "saving" | "saved" | "error";

interface ImageValue {
  url: string;
  path: string;
}

interface QuestionFormValues {
  question: string;
  subtitle?: string;
  image?: ImageValue;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // "0" | "1" | "2" | "3"
  difficulty: Difficulty;
}

type CardModel = {
  key: string;
  /** set for questions that already exist in the backend */
  initial: DBQuestion | null;
};

const newCard = (): CardModel => ({ key: crypto.randomUUID(), initial: null });

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const sortedOptions = (q: DBQuestion) =>
  [...(q.options ?? [])].sort((a, b) => a.sort_order - b.sort_order);

const toFormValues = (q: DBQuestion): Partial<QuestionFormValues> => {
  const opts = sortedOptions(q);
  const correct = opts.findIndex((o) => o.is_correct);
  return {
    question: q.title,
    subtitle: q.subtitle ?? "",
    image: q.image_url ? { url: q.image_url, path: "" } : undefined,
    optionA: opts[0]?.option_text ?? "",
    optionB: opts[1]?.option_text ?? "",
    optionC: opts[2]?.option_text ?? "",
    optionD: opts[3]?.option_text ?? "",
    correctAnswer: String(correct >= 0 ? correct : 0),
    difficulty: (q.difficulty_level || "MEDIUM").toLowerCase() as Difficulty,
  };
};

const errorText = (err: unknown) => {
  const data = (
    err as { response?: { data?: { message?: string; error?: string } } }
  )?.response?.data;
  return data?.message || data?.error || "Could not sync this question";
};

const STATUS_TAG: Record<
  SyncStatus,
  { color: string; icon?: React.ReactNode; label: string }
> = {
  draft: { color: "default", label: "Draft" },
  incomplete: { color: "warning", label: "Fill required fields to sync" },
  saving: { color: "processing", icon: <LoadingOutlined />, label: "Saving…" },
  saved: { color: "success", icon: <CheckCircleOutlined />, label: "Saved" },
  error: {
    color: "error",
    icon: <ExclamationCircleOutlined />,
    label: "Not saved",
  },
};

/* ------------------------------------------------------------------ */
/* One question form. It saves itself once every required field is    */
/* filled, and keeps saving edits afterwards.                         */
/* ------------------------------------------------------------------ */

interface QuestionFormCardProps {
  bankId: string;
  number: number;
  initial: DBQuestion | null;
  onStatus: (status: SyncStatus) => void;
  onRemove: () => void;
  canAdd: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const QuestionFormCard: React.FC<QuestionFormCardProps> = ({
  bankId,
  number,
  initial,
  onStatus,
  onRemove,
  canAdd,
  canUpdate,
  canDelete,
}) => {
  const editable = initial ? canUpdate : canAdd;
  const [form] = Form.useForm<QuestionFormValues>();
  const [status, setStatus] = useState<SyncStatus>(initial ? "saved" : "draft");
  const [errorMessage, setErrorMessage] = useState("");
  // true once the backend has a record, which decides Delete vs Remove
  const [persisted, setPersisted] = useState(!!initial);
  const [showOptional, setShowOptional] = useState(
    !!(initial?.subtitle || initial?.image_url),
  );

  // Ids of the backend records once this question has been created
  const questionId = useRef<string | null>(initial?.question_id ?? null);
  const optionIds = useRef<string[]>(
    initial ? sortedOptions(initial).map((o) => o.option_id) : [],
  );
  const sortOrder = useRef<number>(initial?.sort_order ?? number);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const dirtyWhileSaving = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    onStatus(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const update = (next: SyncStatus, message = "") => {
    if (!mounted.current) return;
    setStatus(next);
    setErrorMessage(message);
  };

  const sync = async () => {
    if (inFlight.current) {
      // edited while a save is running: save again once it finishes
      dirtyWhileSaving.current = true;
      return;
    }

    // Check completeness without painting error messages on a half-filled form
    try {
      await form.validateFields({ validateOnly: true });
    } catch {
      update(questionId.current ? "incomplete" : "draft");
      return;
    }

    const values = form.getFieldsValue(true) as QuestionFormValues;
    const common = {
      question_bank_id: bankId,
      title1: values.question.trim(),
      title2: values.subtitle?.trim() ?? "",
      title3: values.image?.url ?? "",
      level: (values.difficulty || "medium").toUpperCase() as
        | "EASY"
        | "MEDIUM"
        | "HARD",
      sort_order: sortOrder.current,
    };
    const optionTexts = {
      optionA: values.optionA.trim(),
      optionB: values.optionB.trim(),
      optionC: values.optionC.trim(),
      optionD: values.optionD.trim(),
      correct_option: parseInt(values.correctAnswer, 10) + 1,
    };

    inFlight.current = true;
    dirtyWhileSaving.current = false;
    update("saving");

    try {
      if (!questionId.current) {
        const res = await api.post("/question", {
          ...common,
          options: optionTexts,
        });
        const created = res.data?.question as DBQuestion | undefined;
        questionId.current = created?.question_id ?? null;
        optionIds.current = created ? sortedOptions(created).map((o) => o.option_id) : [];
        if (mounted.current) setPersisted(true);
      } else {
        await api.put(`/question/${questionId.current}`, {
          ...common,
          question_id: questionId.current,
          options: {
            ...optionTexts,
            optionA_id: optionIds.current[0],
            optionB_id: optionIds.current[1],
            optionC_id: optionIds.current[2],
            optionD_id: optionIds.current[3],
          },
        });
      }
      update("saved");
    } catch (err) {
      update("error", errorText(err));
    } finally {
      inFlight.current = false;
      if (dirtyWhileSaving.current && mounted.current) sync();
    }
  };

  const scheduleSync = () => {
    if (!editable) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(sync, AUTOSAVE_DELAY_MS);
  };

  const remove = async () => {
    if (timer.current) clearTimeout(timer.current);
    if (questionId.current) {
      try {
        await api.delete(`/question/${questionId.current}`);
      } catch (err) {
        update("error", errorText(err));
        return;
      }
    }
    onRemove();
  };

  const tag = STATUS_TAG[status];

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Text strong>Question {number}</Text>
          <Tag color={tag.color} icon={tag.icon}>
            {tag.label}
          </Tag>
        </Space>
      }
      extra={
        persisted ? (
          canDelete && (
          <Popconfirm
            title="Delete this question?"
            description="It will be removed from the question set."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={remove}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={status === "saving"}
            >
              Delete
            </Button>
          </Popconfirm>
          )
        ) : (
          canAdd && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={status === "saving"}
            onClick={remove}
          >
            Remove
          </Button>
          )
        )
      }
    >
      {status === "error" && (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          style={{ marginBottom: 12 }}
          action={
            <Button size="small" onClick={sync}>
              Retry
            </Button>
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={!editable}
        autoComplete="off"
        requiredMark={false}
        initialValues={
          initial
            ? toFormValues(initial)
            : { difficulty: "medium", correctAnswer: undefined }
        }
        onValuesChange={scheduleSync}
      >
        <Form.Item
          name="question"
          label="प्रश्न (Question)"
          rules={[
            { required: true, whitespace: true, message: "Enter the question" },
          ]}
        >
          <TextArea rows={2} placeholder="Enter question" maxLength={200} showCount />
        </Form.Item>

        <Button
          type="dashed"
          size="small"
          disabled={false}
          style={{ marginBottom: 16 }}
          icon={showOptional ? <MinusOutlined /> : <PlusOutlined />}
          onClick={() => setShowOptional((v) => !v)}
        >
          {showOptional ? "Hide subtitle & image" : "Add subtitle & image (optional)"}
        </Button>

        {/* Kept mounted so values survive hiding the section */}
        <div style={{ display: showOptional ? "block" : "none" }}>
          <Form.Item name="subtitle" label="उपशीर्षक (Subtitle)">
            <TextArea rows={2} placeholder="Enter subtitle if any" maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="image" label="प्रश्नको चित्र (Question Image)">
            <ImageUpload />
          </Form.Item>
        </div>

        <Row gutter={16}>
          {OPTION_LETTERS.map((letter, i) => (
            <Col xs={24} md={12} key={letter}>
              <Form.Item
                name={`option${letter}`}
                label={`${["विकल्प क", "विकल्प ख", "विकल्प ग", "विकल्प घ"][i]} (Option ${letter})`}
                rules={[
                  { required: true, whitespace: true, message: "Required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Row gutter={16} align="middle">
          <Col xs={24} lg={14}>
            <Form.Item
              name="correctAnswer"
              label="सही उत्तर (Correct Answer)"
              rules={[{ required: true, message: "Select the correct answer" }]}
            >
              <Radio.Group>
                <Radio value="0">A</Radio>
                <Radio value="1">B</Radio>
                <Radio value="2">C</Radio>
                <Radio value="3">D</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} lg={10}>
            <Form.Item name="difficulty" label="Difficulty Level">
              <Radio.Group>
                <Radio.Button value="easy">Easy</Radio.Button>
                <Radio.Button value="medium">Medium</Radio.Button>
                <Radio.Button value="hard">Hard</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

const MCQQuestionForm: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canAdd = isAllowed(PERM.QUESTION.ADD);
  const canUpdate = isAllowed(PERM.QUESTION.UPDATE);
  const canDelete = isAllowed(PERM.QUESTION.DELETE);
  const canOpen = isAllowed([
    PERM.QUESTION.LIST,
    PERM.QUESTION.ADD,
    PERM.QUESTION.UPDATE,
  ]);
  const bankIdFromUrl = useSearchParams().get("bankId");
  const [bankId, setBankId] = useState<string | null>(bankIdFromUrl);
  const [cards, setCards] = useState<CardModel[]>([]);
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>({});
  const [count, setCount] = useState<number>(1);

  const { data: banks = [], isLoading: isBanksLoading } = useQueryExamBanks();
  const { data: existing, isFetching } = useQueryBankQuestions(
    bankId ?? "",
    !!bankId,
  );

  // Load the bank's existing questions into forms once per bank, from a fresh
  // fetch, so later refetches never overwrite what is being typed.
  const [hydratedBank, setHydratedBank] = useState<string | null>(null);
  const isQuestionsLoading = !!bankId && hydratedBank !== bankId;
  if (bankId && existing && !isFetching && hydratedBank !== bankId) {
    const saved = [...existing]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({ key: q.question_id, initial: q }));
    setHydratedBank(bankId);
    setCards(saved.length || !canAdd ? saved : [newCard()]);
    setStatuses({});
  }

  const addForms = (n: number) =>
    canAdd &&
    setCards((prev) => [...prev, ...Array.from({ length: n }, newCard)]);

  const onBankChange = (id: string) => {
    setHydratedBank(null);
    setCards([]);
    setStatuses({});
    setBankId(id);
  };

  const values = Object.values(statuses);
  const savedCount = values.filter((s) => s === "saved").length;
  const pendingCount = values.filter(
    (s) => s === "draft" || s === "incomplete",
  ).length;
  const errorCount = values.filter((s) => s === "error").length;

  if (!canOpen) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <Text type="secondary">
        Each question is saved automatically as soon as all of its required
        fields are filled.
      </Text>

      <Card style={{ margin: "24px 0" }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={12}>
            <Text strong>Question set</Text>
            <Select
              showSearch
              style={{ width: "100%", marginTop: 8 }}
              optionFilterProp="label"
              placeholder="Select a question set"
              loading={isBanksLoading}
              value={bankId ?? undefined}
              onChange={onBankChange}
              options={banks.map((b) => ({
                value: b["Question Bank Id"],
                label: b.Title,
              }))}
            />
          </Col>
          {canAdd && (
          <Col xs={24} md={12}>
            <Text strong>Number of question forms</Text>
            <Space.Compact style={{ width: "100%", marginTop: 8 }}>
              <InputNumber
                min={1}
                max={MAX_FORMS_AT_ONCE}
                value={count}
                onChange={(v) => setCount(v ?? 1)}
                style={{ width: 100 }}
                disabled={!bankId}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={!bankId}
                onClick={() => addForms(count)}
              >
                Add {count} form{count > 1 ? "s" : ""}
              </Button>
            </Space.Compact>
          </Col>
          )}
        </Row>
      </Card>

      {!bankId ? (
        <Alert
          type="info"
          showIcon
          title="Select a question set to start adding questions."
        />
      ) : (
        <Spin spinning={isQuestionsLoading}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Tag color="success">{savedCount} saved</Tag>
            {pendingCount > 0 && (
              <Tag color="warning">{pendingCount} not complete</Tag>
            )}
            {errorCount > 0 && <Tag color="error">{errorCount} failed</Tag>}
          </Space>

          {cards.map((card, index) => (
            <QuestionFormCard
              key={`${bankId}-${card.key}`}
              bankId={bankId}
              number={index + 1}
              initial={card.initial}
              onStatus={(status) =>
                setStatuses((prev) =>
                  prev[card.key] === status
                    ? prev
                    : { ...prev, [card.key]: status },
                )
              }
              canAdd={canAdd}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onRemove={() => {
                setCards((prev) => prev.filter((c) => c.key !== card.key));
                setStatuses((prev) => {
                  const rest = { ...prev };
                  delete rest[card.key];
                  return rest;
                });
              }}
            />
          ))}

          {canAdd && !isQuestionsLoading && (
            <Button
              type="dashed"
              block
              size="large"
              icon={<PlusOutlined />}
              onClick={() => addForms(1)}
            >
              Add another question
            </Button>
          )}
        </Spin>
      )}
    </div>
  );
};

export default MCQQuestionForm;
