"use client";

import useModal from "@/app/hooks/useModalHook";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Pagination,
  Card,
  Col,
  Row,
  Tag,
  Spin,
  Popconfirm,
  message,
  List,
  Image,
  Space,
} from "antd";
import { useState, useEffect } from "react";
import { useMutationQuestions, useQueryQuestions } from "../MCQ/useQuestions";
import { useQueryQuestionBank } from "./useQueryQuestionBank";
import { useMutationQuestionBank } from "./useMutationQuestionBank";
import { useQueryQuestionBankCategories } from "../../QuestionBankCagetory/useQueryQuestionBank";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export type QuestionBank = {
  id: number;
  "Question Bank Id": string;
  Title: string;
  "No Of Questions": number;
  "Duration In Minutes": number;
  Category: {
    question_bank_category_id: string;
    title: string;
  };
  "Total Marks": number;
  "Pass Marks": number;
  "Created At": string;
  "Updated At": string;
};

export type QuestionBankAdd = {
  title: string;
  questions: number;
  duration: string;
  category: string;
  total_marks: number;
  passing_marks: number;
};

type Category = {
  ID: number;
  QuestionBankCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  UpdatedBy: string;
};

export default function QuestionBank() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestionBankId, setCurrentQuestionBankId] = useState<
    string | null
  >(null);

  const {
    addQuestionBank,
    updateQuestionBank,
    deleteQuestionBank,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingQuestionBank,
    editingQuestionBank,
  } = useMutationQuestionBank();

  const { questionBanks, isLoading, refetch } = useQueryQuestionBank();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useQueryQuestionBankCategories();

  // States for viewing questions
  const [viewBank, setViewBank] = useState<QuestionBank | null>(null);
  const [viewQuestionsPage, setViewQuestionsPage] = useState(1);
  const [viewQuestionsSearch, setViewQuestionsSearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  // Fetch questions for the selected bank
  const { data: questionsResponse, isLoading: isQuestionsLoading } =
    useQueryQuestions(viewBank ? viewBank["Question Bank Id"] : null, {
      page: viewQuestionsPage,
      limit: 5,
      search: viewQuestionsSearch,
    });

  const pageSize = 6;

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setIsEditMode(false);
      setCurrentQuestionBankId(null);
      setEditingQuestionBank(null);
    }
  }, [open, form, setEditingQuestionBank]);

  useEffect(() => {
    if (editingQuestionBank && open) {
      form.setFieldsValue({
        title: editingQuestionBank.Title,
        questions: editingQuestionBank["No Of Questions"],
        duration: editingQuestionBank["Duration In Minutes"],
        category: editingQuestionBank.Category?.question_bank_category_id,
        total_marks: editingQuestionBank["Total Marks"],
        passing_marks: editingQuestionBank["Pass Marks"],
      });
      setIsEditMode(true);
      setCurrentQuestionBankId(editingQuestionBank["Question Bank Id"]);
    }
  }, [editingQuestionBank, open, form]);

  const onFinish = (values: QuestionBankAdd) => {
    if (isEditMode && currentQuestionBankId) {
      updateQuestionBank({
        id: currentQuestionBankId,
        payload: values,
      });
      message.success("Question bank updated successfully!");
    } else {
      addQuestionBank(values);
      message.success("Question bank added successfully!");
    }

    form.resetFields();
    hideModal();
    setIsEditMode(false);
    setCurrentQuestionBankId(null);
    setEditingQuestionBank(null);
    refetch();
  };

  const handleEdit = (questionBank: QuestionBank) => {
    setEditingQuestionBank(questionBank);
    showModal();
  };

  const handleDelete = (id: string) => {
    deleteQuestionBank(id);
    message.success("Question bank deleted successfully!");
    refetch();
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setCurrentQuestionBankId(null);
    setEditingQuestionBank(null);
    form.resetFields();
    showModal();
  };

  const router = useRouter();
  const { setQuestionBankId, setParams } = useMutationQuestions();

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Question Bank</h1>
        <Button type="primary" onClick={handleAddNew}>
          Add Question Bank
        </Button>
      </div>

      <Spin spinning={isLoading} description="Loading question banks...">
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={questionBanks?.pagination?.limit || pageSize}
            total={questionBanks?.pagination?.total || 0}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
        <Row gutter={[16, 16]}>
          {questionBanks?.data?.map((item: QuestionBank) => (
            <Col xs={24} sm={12} lg={8} key={item?.["Question Bank Id"]}>
              <Card
                onClick={() => {
                  setQuestionBankId(item?.["Question Bank Id"]);
                  router.push(
                    `/dashboard/question/mcq?bankId=${item?.["Question Bank Id"]}`,
                  );
                }}
                hoverable
                title={item.Title}
                extra={<Tag color="blue">{item?.Category.title}</Tag>}
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    key="view"
                    onClick={() => {
                      setViewBank(item);
                      setViewQuestionsPage(1);
                      setViewQuestionsSearch("");
                    }}
                  >
                    View
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    key="edit"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete Question Bank"
                    description="Are you sure you want to delete this question bank?"
                    onConfirm={() => handleDelete(item["Question Bank Id"])}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ loading: isDeleting }}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div>
                    <strong>Questions:</strong> {item?.["No Of Questions"]}
                  </div>

                  <div>
                    <strong>Duration:</strong> {item?.["Duration In Minutes"]}{" "}
                    minutes
                  </div>

                  <div>
                    <strong>Total Marks:</strong> {item?.["Total Marks"]}
                  </div>

                  <div>
                    <strong>Pass Marks:</strong> {item?.["Pass Marks"]}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {questionBanks?.data?.length === 0 && !isLoading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p>
              No question banks found. Click "Add Question Bank" to create one.
            </p>
          </div>
        )}
      </Spin>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {isEditMode ? "Edit Question Bank" : "Add Question Bank"}
          </span>
        }
        open={open}
        onCancel={() => {
          form.resetFields();
          hideModal();
          setIsEditMode(false);
          setCurrentQuestionBankId(null);
          setEditingQuestionBank(null);
        }}
        width={700}
        style={{ top: "5vh" }}
        styles={{
          body: {
            maxHeight: "calc(80vh - 110px)",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
        destroyOnHidden
        footer={
          <>
            <Button
              type="default"
              onClick={() => {
                form.resetFields();
                hideModal();
                setIsEditMode(false);
                setCurrentQuestionBankId(null);
                setEditingQuestionBank(null);
              }}
            >
              Cancel
            </Button>
            <Button
              loading={isAdding || isUpdating}
              type="primary"
              key="submit"
              onClick={() => form.submit()}
            >
              {isEditMode ? "Update Question Bank" : "Save Question Bank"}
            </Button>
          </>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Title */}
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Please enter the title",
              },
              {
                min: 3,
                message: "Title must be at least 3 characters",
              },
            ]}
          >
            <Input size="large" placeholder="Enter question bank title" />
          </Form.Item>

          {/* Number of Questions */}
          <Form.Item
            label="Number of Questions"
            name="questions"
            rules={[
              {
                required: true,
                message: "Please enter the number of questions",
              },
              {
                type: "number",
                min: 1,
                message: "Must have at least 1 question",
              },
              {
                type: "number",
                max: 50,
                message: "Cannot exceed 50 questions",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={50}
              placeholder="Enter number of questions"
              style={{ width: "100%" }}
            />
          </Form.Item>

          {/* Time (in minutes) */}
          <Form.Item
            label="Time (minutes)"
            name="duration"
            rules={[
              {
                required: true,
                message: "Please enter the time duration",
              },
              {
                type: "number",
                min: 1,
                message: "Duration must be at least 1 minute",
              },
              {
                type: "number",
                max: 180,
                message: "Duration cannot exceed 180 minutes",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              max={180}
              placeholder="Enter time in minutes"
              style={{ width: "100%" }}
            />
          </Form.Item>

          {/* Category (Dropdown) */}
          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message: "Please select a category",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select a category"
              loading={isCategoriesLoading}
              options={categoriesData?.map((category: Category) => ({
                value: category.QuestionBankCategoryID,
                label: category.Title,
              }))}
            />
          </Form.Item>

          {/* Total Marks */}
          <Form.Item
            label="Total Marks"
            name="total_marks"
            rules={[
              {
                required: true,
                message: "Please enter the total marks",
              },
              {
                type: "number",
                min: 1,
                message: "Total marks must be at least 1",
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              placeholder="Enter total marks"
              style={{ width: "100%" }}
            />
          </Form.Item>

          {/* Pass Marks */}
          <Form.Item
            label="Pass Marks"
            name="passing_marks"
            rules={[
              {
                required: true,
                message: "Please enter the pass marks",
              },
              {
                type: "number",
                min: 1,
                message: "Pass marks must be at least 1",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const totalMarks = getFieldValue("total_marks");
                  if (value && totalMarks && value > totalMarks) {
                    return Promise.reject(
                      new Error("Pass marks cannot exceed total marks"),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              size="large"
              min={1}
              placeholder="Enter pass marks"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Questions List Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            Questions in "{viewBank?.Title}"
          </span>
        }
        open={viewBank !== null}
        onCancel={() => {
          setViewBank(null);
          setSelectedQuestion(null);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setViewBank(null)}>
            Close
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search questions by title..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            allowClear
            value={viewQuestionsSearch}
            onChange={(e) => {
              setViewQuestionsSearch(e.target.value);
              setViewQuestionsPage(1); // reset page on search
            }}
          />
        </div>

        <Spin spinning={isQuestionsLoading} tip="Loading questions...">
          <List
            dataSource={questionsResponse?.data || []}
            renderItem={(q: any) => (
              <List.Item
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  marginBottom: "4px",
                }}
                onClick={() => setSelectedQuestion(q)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: 15 }}>
                      Q: {q.title}
                    </span>
                    <Space>
                      <Tag
                        color={
                          q.difficulty_level === "EASY"
                            ? "green"
                            : q.difficulty_level === "MEDIUM"
                              ? "blue"
                              : q.difficulty_level === "HARD"
                                ? "orange"
                                : "red"
                        }
                      >
                        {q.difficulty_level}
                      </Tag>
                      <Tag color="purple">Sort: {q.sort_order}</Tag>
                    </Space>
                  </div>
                  {q.subtitle && (
                    <div
                      style={{ color: "#8c8c8c", marginTop: 4, fontSize: 13 }}
                    >
                      {q.subtitle}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
            locale={{ emptyText: "No questions found in this question bank" }}
          />

          <div
            style={{ display: "flex", justifyContent: "end", marginTop: 16 }}
          >
            <Pagination
              current={viewQuestionsPage}
              pageSize={5}
              total={questionsResponse?.pagination?.total || 0}
              onChange={setViewQuestionsPage}
              showSizeChanger={false}
            />
          </div>
        </Spin>
      </Modal>

      {/* Question Details Modal */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>Question Detail</span>
        }
        open={selectedQuestion !== null}
        onCancel={() => setSelectedQuestion(null)}
        width={600}
        footer={[
          <Button key="back" onClick={() => setSelectedQuestion(null)}>
            Back to List
          </Button>,
        ]}
      >
        {selectedQuestion && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space style={{ marginBottom: 8 }}>
                <Tag color={selectedQuestion.is_active ? "success" : "default"}>
                  {selectedQuestion.is_active ? "Active" : "Inactive"}
                </Tag>
                <Tag color="geekblue">{selectedQuestion.difficulty_level}</Tag>
                <Tag color="purple">
                  Sort Order: {selectedQuestion.sort_order}
                </Tag>
              </Space>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#262626" }}>
                {selectedQuestion.title}
              </div>
              {selectedQuestion.subtitle && (
                <div style={{ fontSize: 14, color: "#8c8c8c", marginTop: 4 }}>
                  {selectedQuestion.subtitle}
                </div>
              )}
            </div>

            {selectedQuestion.image_url && (
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <Image
                  src={selectedQuestion.image_url}
                  alt="Question graphic"
                  style={{
                    maxHeight: 200,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Options:</div>
              <Row gutter={[12, 12]}>
                {selectedQuestion.options?.map((opt: any) => (
                  <Col span={12} key={opt.option_id}>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        border: opt.is_correct
                          ? "2px solid #52c41a"
                          : "1px solid #d9d9d9",
                        backgroundColor: opt.is_correct ? "#f6ffed" : "#ffffff",
                        transition: "all 0.3s",
                        position: "relative",
                        height: "100%",
                      }}
                    >
                      <div style={{ paddingRight: opt.is_correct ? 24 : 0 }}>
                        {opt.option_text}
                      </div>
                      {opt.is_correct && (
                        <CheckCircleOutlined
                          style={{
                            color: "#52c41a",
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: 16,
                          }}
                        />
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
