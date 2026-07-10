// components/MCQQuestionForm.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileAddOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash/debounce";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Types
interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionFormValues {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

// Mock API functions
const mockSaveQuestions = async (
  questions: MCQQuestion[],
): Promise<MCQQuestion[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const updatedQuestions = questions.map((q) => ({
    ...q,
    updatedAt: new Date().toISOString(),
    createdAt: q.createdAt || new Date().toISOString(),
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem("mcq_questions", JSON.stringify(updatedQuestions));
  }

  return updatedQuestions;
};

const mockFetchQuestions = async (): Promise<MCQQuestion[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mcq_questions");
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
};

// Helper function to generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const MCQQuestionForm: React.FC = () => {
  const [form] = Form.useForm<QuestionFormValues>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch questions using React Query
  const { data: questions = [], isLoading } = useQuery<MCQQuestion[]>({
    queryKey: ["mcq-questions"],
    queryFn: mockFetchQuestions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save mutation with React Query
  const saveMutation = useMutation<MCQQuestion[], Error, MCQQuestion[]>({
    mutationFn: mockSaveQuestions,
    onSuccess: (savedQuestions) => {
      queryClient.setQueryData(["mcq-questions"], savedQuestions);
      message.success("Questions saved successfully!");
    },
    onError: () => {
      message.error("Failed to save questions");
    },
  });

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce((questionsToSave: MCQQuestion[]) => {
        saveMutation.mutate(questionsToSave);
      }, 300000),
    [saveMutation],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Effect to auto-save when questions change
  useEffect(() => {
    if (questions.length > 0) {
      debouncedSave(questions);
    }
  }, [questions, debouncedSave]);

  // Handle form submission
  const handleSubmit = (values: QuestionFormValues): void => {
    setIsSubmitting(true);
    try {
      const newQuestion: MCQQuestion = {
        id: editingId || generateId(),
        question: values.question,
        options: [
          values.optionA,
          values.optionB,
          values.optionC,
          values.optionD,
        ],
        correctAnswer: parseInt(values.correctAnswer),
        category: values.category || "General",
        difficulty: values.difficulty || "medium",
      };

      let updatedQuestions: MCQQuestion[];
      if (editingId) {
        // Update existing question
        updatedQuestions = questions.map((q) =>
          q.id === editingId ? newQuestion : q,
        );
        setEditingId(null);
        message.success("Question updated!");
      } else {
        // Add new question
        updatedQuestions = [newQuestion, ...questions];
        message.success("Question added!");
      }

      // Update React Query cache
      queryClient.setQueryData(["mcq-questions"], updatedQuestions);
      form.resetFields();

      // Auto-save will handle saving
    } catch (error) {
      message.error("Failed to submit question");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete question
  const handleDelete = (id: string): void => {
    const updatedQuestions = questions.filter((q) => q.id !== id);
    queryClient.setQueryData(["mcq-questions"], updatedQuestions);
    message.success("Question deleted!");
  };

  // Handle edit question
  const handleEdit = (id: string): void => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      setEditingId(id);
      form.setFieldsValue({
        question: question.question,
        optionA: question.options[0] || "",
        optionB: question.options[1] || "",
        optionC: question.options[2] || "",
        optionD: question.options[3] || "",
        correctAnswer: question.correctAnswer.toString(),
        category: question.category || "General",
        difficulty: question.difficulty || "medium",
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = (): void => {
    setEditingId(null);
    form.resetFields();
  };

  // Manual save trigger
  const handleManualSave = (): void => {
    if (questions.length > 0) {
      saveMutation.mutate(questions);
    } else {
      message.warning("No questions to save");
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "hard":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* <Title level={2}>MCQ Question Management</Title> */}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                {editingId ? <EditOutlined /> : <FileAddOutlined />}
                {editingId ? "Edit Question" : "Add New Question"}
              </Space>
            }
            variant={"borderless"}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                name="question"
                label="प्रश्न (Question)"
                rules={[
                  { required: true, message: "Please enter the question" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="तपाईको सिारी पछावि एम्बुलेन्स आएमा केगनघुहुन्छ ?"
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="optionA"
                    label="विकल्प क (Option A)"
                    rules={[
                      { required: true, message: "Please enter option A" },
                    ]}
                  >
                    <Input placeholder="र्ाडी रोक्ने" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="optionB"
                    label="विकल्प ख (Option B)"
                    rules={[
                      { required: true, message: "Please enter option B" },
                    ]}
                  >
                    <Input placeholder="साईड लदने" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="optionC"
                    label="विकल्प ग (Option C)"
                    rules={[
                      { required: true, message: "Please enter option C" },
                    ]}
                  >
                    <Input placeholder="लस्पड बढाउने" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="optionD"
                    label="विकल्प घ (Option D)"
                    rules={[
                      { required: true, message: "Please enter option D" },
                    ]}
                  >
                    <Input placeholder="ओभरटेक र्ने" />
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
                  <Form.Item name="category" label="Category">
                    <Input placeholder="e.g., Traffic, Health" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="difficulty" label="Difficulty Level">
                    <Radio.Group>
                      <Radio.Button value="easy">Easy</Radio.Button>
                      <Radio.Button value="medium">Medium</Radio.Button>
                      <Radio.Button value="hard">Hard</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={editingId ? <EditOutlined /> : <PlusOutlined />}
                    loading={isSubmitting}
                  >
                    {editingId ? "Update Question" : "Add Question"}
                  </Button>
                  {editingId && (
                    <Button onClick={handleCancelEdit}>Cancel Edit</Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text>Questions List</Text>
                <Tag color="blue">{questions.length} questions</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleManualSave}
                  loading={saveMutation.isPending}
                >
                  Save All
                </Button>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <Alert
                message="No questions added yet"
                description="Start by adding your first MCQ question above."
                type="info"
                showIcon
              />
            ) : (
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {questions.map((q, index) => (
                  <Card
                    key={q.id}
                    size="small"
                    style={{
                      marginBottom: "12px",
                      borderLeft: `4px solid ${getDifficultyColor(q.difficulty)}`,
                    }}
                  >
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong>
                          Q{index + 1}: {q.question}
                        </Text>
                        <Space>
                          <Tooltip title="Edit">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(q.id)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(q.id)}
                              size="small"
                            />
                          </Tooltip>
                        </Space>
                      </div>

                      <div style={{ paddingLeft: "16px" }}>
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            style={{
                              marginBottom: "4px",
                              color:
                                idx === q.correctAnswer ? "#52c41a" : "inherit",
                              fontWeight:
                                idx === q.correctAnswer ? "bold" : "normal",
                            }}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                            {idx === q.correctAnswer && " ✓"}
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        {q.category && <Tag color="geekblue">{q.category}</Tag>}
                        {q.difficulty && (
                          <Tag color={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Tag>
                        )}
                        {q.updatedAt && (
                          <Tag color="default">
                            Updated:{" "}
                            {new Date(q.updatedAt).toLocaleDateString()}
                          </Tag>
                        )}
                      </div>
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Save status indicator */}
      {saveMutation.isPending && (
        <Alert
          title="Saving questions..."
          type="info"
          showIcon
          style={{ marginTop: "16px", zIndex: 1000 }}
        />
      )}
      {saveMutation.isSuccess && (
        <Alert
          title="Questions saved successfully!"
          type="success"
          showIcon
          style={{ marginTop: "16px", zIndex: 1000 }}
          closable
        />
      )}
    </div>
  );
};

export default MCQQuestionForm;
