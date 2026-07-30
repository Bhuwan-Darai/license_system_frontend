"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Radio,
  Row,
  Col,
  Typography,
  message,
  Alert,
  Tag,
  Tooltip,
  Select,
  InputNumber,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FileAddOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryQuestionBank } from "../Bank/useQueryQuestionBank";
import { QuestionBank } from "../Bank/QuestionBank";
import {
  useMutationQuestions,
  useQueryQuestions,
  DBQuestion,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "./useQuestions";
import ImageUpload from "@/app/components/ui/UploadImage";
import { useSearchParams } from "next/navigation";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ImageValue {
  url: string;
  path: string;
}

interface QuestionFormValues {
  question_bank_id: string;
  question_id: string;
  question: string;
  subtitle?: string;
  image?: ImageValue;
  optionA_id?: string;
  optionB_id?: string;
  optionC_id?: string;
  optionD_id?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // "0" | "1" | "2" | "3"
  difficulty?: "easy" | "medium" | "hard";
  sortOrder?: number;
}

// ---------- Build an update payload from an existing DBQuestion ----------
const buildPayloadFromQuestion = (
  q: DBQuestion,
  sortOrder: number,
): UpdateQuestionPayload => {
  const sortedOpts = [...(q.options || [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const correctIndex = sortedOpts.findIndex((o) => o.is_correct);

  return {
    question_bank_id: q.question_bank_id,
    question_id: q.question_id,
    title1: q.title,
    title2: (q as any).subtitle || "",
    title3: (q as any).image_url || "",
    options: {
      optionA_id: sortedOpts[0]?.option_id ?? "",
      optionB_id: sortedOpts[1]?.option_id ?? "",
      optionC_id: sortedOpts[2]?.option_id ?? "",
      optionD_id: sortedOpts[3]?.option_id ?? "",
      optionA: sortedOpts[0]?.option_text || "",
      optionB: sortedOpts[1]?.option_text || "",
      optionC: sortedOpts[2]?.option_text || "",
      optionD: sortedOpts[3]?.option_text || "",
      correct_option: (correctIndex >= 0 ? correctIndex : 0) + 1,
    },
    level: (q.difficulty_level || "MEDIUM").toUpperCase() as any,
    sort_order: sortOrder,
  };
};

// ---------- Sortable wrapper for a single question card ----------
interface SortableQuestionCardProps {
  q: DBQuestion;
  index: number;
  onEdit: (q: DBQuestion) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  getDifficultyColor: (level?: string) => string;
}

const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  q,
  index,
  onEdit,
  onDelete,
  isDeleting,
  getDifficultyColor,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.question_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sortedOpts = [...(q.options || [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderLeft: `4px solid ${getDifficultyColor(q.difficulty_level)}`,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Space align="start">
              <Tooltip title="Drag to reorder">
                <span
                  {...attributes}
                  {...listeners}
                  style={{ cursor: "grab", touchAction: "none", paddingTop: 4 }}
                >
                  <HolderOutlined />
                </span>
              </Tooltip>
              <Text strong>
                Q{index + 1}: {q.title}
              </Text>
            </Space>
            <Space>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(q)}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={isDeleting}
                  onClick={() => onDelete(q.question_id)}
                  size="small"
                />
              </Tooltip>
            </Space>
          </div>

          <div style={{ paddingLeft: 8 }}>
            {sortedOpts.map((opt, idx) => (
              <div
                key={opt.option_id}
                style={{
                  marginBottom: 4,
                  color: opt.is_correct ? "#52c41a" : "inherit",
                  fontWeight: opt.is_correct ? "bold" : "normal",
                }}
              >
                {String.fromCharCode(65 + idx)}. {opt.option_text}
                {opt.is_correct && " ✓"}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Tag color={getDifficultyColor(q.difficulty_level)}>
              {q.difficulty_level}
            </Tag>
            <Tag color="default">Sort: {q.sort_order}</Tag>
            <Tag color={q.is_active ? "success" : "default"}>
              {q.is_active ? "Active" : "Inactive"}
            </Tag>
          </div>
        </Space>
      </Card>
    </div>
  );
};

const MCQQuestionForm: React.FC = () => {
  const [form] = Form.useForm<QuestionFormValues>();
  const [editingId, setEditingId] = useState<string | null>(null); // question_id
  const [editingOptionIds, setEditingOptionIds] = useState<{
    optionA_id?: string;
    optionB_id?: string;
    optionC_id?: string;
    optionD_id?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const search = useSearchParams();
  const bankIdFromUrl = search.get("bankId");

  const { questionBanks, isLoading: isQuestionBankLoading } =
    useQueryQuestionBank();

  const {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    isUpdating,
    isDeleting,
  } = useMutationQuestions();

  // Fetch questions for the selected bank
  const { data: questionsResponse, isLoading: isQuestionsLoading } =
    useQueryQuestions(bankIdFromUrl, {
      page: 1,
      limit: 50, // or keep 10 + pagination later
      search: "",
    });

  // Real list from API
  const questions: DBQuestion[] = questionsResponse?.data ?? [];

  // Local ordered copy so drag-and-drop can reorder instantly,
  // ahead of the server round-trip / refetch.
  const [orderedQuestions, setOrderedQuestions] = useState<DBQuestion[]>([]);

  useEffect(() => {
    const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);
    setOrderedQuestions(sorted);
  }, [questions]);

  // Pre-select bank from URL
  useEffect(() => {
    if (bankIdFromUrl) {
      form.setFieldsValue({ question_bank_id: bankIdFromUrl });
    }
  }, [bankIdFromUrl, form]);

  // ---------- Drag and drop sensors ----------
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // avoid hijacking clicks on Edit/Delete
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedQuestions.findIndex(
      (q) => q.question_id === active.id,
    );
    const newIndex = orderedQuestions.findIndex(
      (q) => q.question_id === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const previousOrder = orderedQuestions;
    const reordered = arrayMove(orderedQuestions, oldIndex, newIndex);

    // Optimistic UI update, re-numbering sort_order to match new positions
    const renumbered = reordered.map((q, idx) => ({ ...q, sort_order: idx }));
    setOrderedQuestions(renumbered);

    // Persist only the questions whose sort_order actually changed
    try {
      const toPersist = renumbered.filter((q) => {
        const original = previousOrder.find(
          (oq) => oq.question_id === q.question_id,
        );
        return original && original.sort_order !== q.sort_order;
      });

      await Promise.all(
        toPersist.map((q) =>
          updateQuestion(buildPayloadFromQuestion(q, q.sort_order)),
        ),
      );
    } catch (error) {
      console.error("Reorder error:", error);
      message.error("Could not save the new order. Please try again.");
      // Roll back to the previous order on failure
      setOrderedQuestions(previousOrder);
    }
  };

  // ---------- Submit (create or update) ----------
  const handleSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        const payload: UpdateQuestionPayload = {
          question_bank_id: values.question_bank_id,
          question_id: values.question_id,
          title1: values.question,
          title2: values.subtitle || "",
          title3: values.image?.url || "",
          options: {
            optionA_id: values.optionA_id ?? "",
            optionB_id: values.optionB_id ?? "",
            optionC_id: values.optionC_id ?? "",
            optionD_id: values.optionD_id ?? "",
            optionA: values.optionA,
            optionB: values.optionB,
            optionC: values.optionC,
            optionD: values.optionD,
            correct_option: parseInt(values.correctAnswer, 10) + 1, // API is 1-based
          },
          level: (values.difficulty || "medium").toUpperCase() as any,
          sort_order: values.sortOrder ?? 0,
        };
        await updateQuestion(payload);
        setEditingId(null);
      } else {
        const payload: CreateQuestionPayload = {
          question_bank_id: values.question_bank_id,
          question_id: values.question_id,
          title1: values.question,
          title2: values.subtitle || "",
          title3: values.image?.url || "",
          options: {
            optionA: values.optionA,
            optionB: values.optionB,
            optionC: values.optionC,
            optionD: values.optionD,
            correct_option: parseInt(values.correctAnswer, 10) + 1, // API is 1-based
          },
          level: (values.difficulty || "medium").toUpperCase() as any,
          sort_order: values.sortOrder ?? 0,
        };
        await createQuestion(payload);
      }

      form.resetFields();
      if (bankIdFromUrl) {
        form.setFieldsValue({ question_bank_id: bankIdFromUrl });
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (questionId: string) => {
    try {
      await deleteQuestion(questionId);
    } catch (e) {
      // error already handled in the mutation
    }
  };

  // ---------- Edit – map API shape → form ----------
  const handleEdit = (q: DBQuestion) => {
    setEditingId(q.question_id);

    const sortedOpts = [...(q.options || [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    );

    setEditingOptionIds({
      optionA_id: sortedOpts[0]?.option_id,
      optionB_id: sortedOpts[1]?.option_id,
      optionC_id: sortedOpts[2]?.option_id,
      optionD_id: sortedOpts[3]?.option_id,
    });

    const correctIndex = sortedOpts.findIndex((o) => o.is_correct);

    form.setFieldsValue({
      question_bank_id: q.question_bank_id,
      question_id: q.question_id,
      question: q.title,
      subtitle: (q as any).subtitle || "",
      optionA_id: sortedOpts[0]?.option_id,
      optionB_id: sortedOpts[1]?.option_id,
      optionC_id: sortedOpts[2]?.option_id,
      optionD_id: sortedOpts[3]?.option_id,
      optionA: sortedOpts[0]?.option_text || "",
      optionB: sortedOpts[1]?.option_text || "",
      optionC: sortedOpts[2]?.option_text || "",
      optionD: sortedOpts[3]?.option_text || "",
      correctAnswer: correctIndex >= 0 ? String(correctIndex) : "0",
      difficulty: (q.difficulty_level || "MEDIUM").toLowerCase() as any,
      sortOrder: q.sort_order,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.resetFields();
    if (bankIdFromUrl) {
      form.setFieldsValue({ question_bank_id: bankIdFromUrl });
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch ((level || "").toUpperCase()) {
      case "EASY":
        return "green";
      case "HARD":
      case "EXPERT":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {/* <Title level={2}>MCQ Question Management</Title> */}

      <Row gutter={[24, 24]}>
        {/* ========== LEFT: Form ========== */}
        <Col xs={24} lg={11}>
          <Card
            title={
              <Space>
                {editingId ? <EditOutlined /> : <FileAddOutlined />}
                {editingId ? "Edit Question" : "Add New Question"}
              </Space>
            }
            variant="borderless"
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "sticky",
              top: 24,
            }}
          >
            <div
              style={{
                maxHeight: "calc(100vh - 220px)",
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  name="question_bank_id"
                  label="Question Bank"
                  rules={[
                    {
                      required: true,
                      message: "Please select a Question bank",
                    },
                  ]}
                >
                  <Select
                    showSearch={{
                      optionFilterProp: "label",
                    }}
                    placeholder="Search to Select"
                    loading={isQuestionBankLoading}
                    getPopupContainer={() => document.body}
                    options={questionBanks?.data?.map((b: QuestionBank) => ({
                      value: b["Question Bank Id"],
                      label: b.Title,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  name="question"
                  label="प्रश्न (Question)"
                  rules={[
                    { required: true, message: "Please enter the question" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter question"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>

                <Form.Item name="subtitle" label="उपशीर्षक (Subtitle)">
                  <TextArea
                    rows={2}
                    placeholder="Enter subtitle if any"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>

                <Form.Item name="image" label="प्रश्नको चित्र (Question Image)">
                  <ImageUpload />
                </Form.Item>

                <Form.Item name="question_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="optionA_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="optionB_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="optionC_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="optionD_id" hidden>
                  <Input />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="optionA"
                      label="विकल्प क (Option A)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="optionB"
                      label="विकल्प ख (Option B)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="optionC"
                      label="विकल्प ग (Option C)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="optionD"
                      label="विकल्प घ (Option D)"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="correctAnswer"
                  label="सही उत्तर (Correct Answer)"
                  rules={[
                    { required: true, message: "Please select correct answer" },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="0">विकल्प क (A)</Radio>
                    <Radio value="1">विकल्प ख (B)</Radio>
                    <Radio value="2">विकल्प ग (C)</Radio>
                    <Radio value="3">विकल्प घ (D)</Radio>
                  </Radio.Group>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="difficulty" label="Difficulty Level">
                      <Radio.Group>
                        <Radio.Button value="easy">Easy</Radio.Button>
                        <Radio.Button value="medium">Medium</Radio.Button>
                        <Radio.Button value="hard">Hard</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="sortOrder" label="Sort Order">
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                      loading={isSubmitting || isUpdating}
                    >
                      {editingId ? "Update Question" : "Add Question"}
                    </Button>
                    {editingId && (
                      <Button onClick={handleCancelEdit}>Cancel Edit</Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        {/* ========== DIVIDER ========== */}
        <Col
          xs={0}
          lg={1}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Divider
            orientation="vertical"
            style={{ height: "100%", minHeight: 600 }}
          />
        </Col>

        {/* ========== RIGHT: List ========== */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space orientation="horizontal">
                <Text>Questions List</Text>
                <Tag color="blue">{orderedQuestions.length} questions</Tag>
              </Space>
            }
            variant="borderless"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {isQuestionsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                Loading questions...
              </div>
            ) : orderedQuestions.length === 0 ? (
              <Alert
                title="No questions yet"
                description="Add your first MCQ question on the left."
                type="info"
                showIcon
              />
            ) : (
              <div
                style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedQuestions.map((q) => q.question_id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedQuestions.map((q, index) => (
                      <SortableQuestionCard
                        key={q.question_id}
                        q={q}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        getDifficultyColor={getDifficultyColor}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MCQQuestionForm;
