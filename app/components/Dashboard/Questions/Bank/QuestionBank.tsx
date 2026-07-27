"use client";

import useModal from "@/app/hooks/useModalHook";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  TimePicker,
  Pagination,
  Card,
  Col,
  Row,
  Tag,
  Spin,
} from "antd";
import { useState } from "react";
import { useQueryQuestionBank } from "./useQueryQuestionBank";
import { useMutationQuestionBank } from "./useMutationQuestionBank";
import { useQueryQuestionBankCategories } from "../../QuestionBankCagetory/useQueryQuestionBank";

type QuestionBank = {
  id: number;
  "Question Bank Id": string;
  Title: string;
  "No Of Questions": number;
  "Duration In Minutes": number;
  Category: string;
  "Total Marks": number;
  "Pass Marks": number;
  "Created At": string; // ISO datetime
  "Updated At": string; // ISO datetime
};

export type QuestionBankAdd = {
  title: string;
  questions: number;
  duration: string; // ISO datetime
  category: string;
  total_marks: number;
  passing_marks: number;
};

type Category = {
  ID: number;
  QuestionBankCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string; // ISO datetime
  CreatedBy: string;
  UpdatedAt: string; // ISO datetime
  UpdatedBy: string;
};
export default function QuestionBank() {
  const { open, showModal, hideModal } = useModal();
  const [form] = Form.useForm();
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
  const { questionBanks, isLoading } = useQueryQuestionBank();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useQueryQuestionBankCategories();

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  // Mock categories for the dropdown (replace with actual data)

  console.log("Question Banks:", questionBanks);

  const onFinish = (values: QuestionBankAdd) => {
    console.log("Question Bank values:", values);
    addQuestionBank(values);
    form.resetFields();
    hideModal();
  };

  return (
    <div>
      <h1>Question Bank</h1>
      <Button type="primary" onClick={showModal}>
        Add Question Bank
      </Button>
      <Spin spinning={isLoading} tip="Loading question banks...">
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {questionBanks?.data?.map((item: QuestionBank) => (
            <Col xs={24} sm={12} lg={8} key={item["Question Bank Id"]}>
              <Card
                hoverable
                title={item.Title}
                extra={<Tag color="blue">{item?.Category}</Tag>}
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

                  <Button type="primary" block style={{ marginTop: 10 }}>
                    View Details
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={questionBanks?.pagination?.total || 0}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            Add Question Bank
          </span>
        }
        open={open}
        onCancel={() => {
          form.resetFields();
          hideModal();
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
              }}
            >
              Cancel
            </Button>
            <Button type="primary" key="submit" onClick={() => form.submit()}>
              Save Question Bank
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
                validator(_, value) {
                  if (typeof value === "string") {
                    return Promise.reject(
                      new Error("Please enter valid number of questions"),
                    );
                  }
                  if (value > 10) {
                    return Promise.reject(
                      new Error("Number of questions must be less than 10"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              size="large"
              min={1}
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
            ]}
          >
            <InputNumber
              size="large"
              min={1}
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
    </div>
  );
}
