"use client";

import useModal from "@/app/hooks/useModalHook";
import { Modal, Form, Input, Button, Select, InputNumber, TimePicker, Pagination, Card, Col, Row, Tag } from "antd";
import { useState } from "react";
const questionBanks = [
    {
        id: 1,
        title: "General Knowledge Set 1",
        category: "General Knowledge",
        questions: 10,
        duration: "30 mins",
        totalMarks: 100,
        passMarks: 40,
    },
    {
        id: 2,
        title: "JavaScript Basics",
        category: "Technical",
        questions: 8,
        duration: "25 mins",
        totalMarks: 80,
        passMarks: 32,
    },
    {
        id: 3,
        title: "React Interview",
        category: "Technical",
        questions: 10,
        duration: "45 mins",
        totalMarks: 100,
        passMarks: 50,
    },
    {
        id: 4,
        title: "Coding Challenge",
        category: "Coding",
        questions: 5,
        duration: "60 mins",
        totalMarks: 50,
        passMarks: 30,
    },
    {
        id: 5,
        title: "Logical Reasoning",
        category: "Aptitude",
        questions: 10,
        duration: "40 mins",
        totalMarks: 100,
        passMarks: 45,
    },
];

export default function QuestionBank() {
    const { open, showModal, hideModal } = useModal();
    const [form] = Form.useForm();

    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 6;

    // Mock categories for the dropdown (replace with actual data)
    const categories = [
        { value: "general", label: "General Knowledge" },
        { value: "technical", label: "Technical" },
        { value: "aptitude", label: "Aptitude" },
        { value: "coding", label: "Coding" },
    ];

    const paginatedData = questionBanks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const onFinish = (values: any) => {
        console.log("Question Bank values:", values);
        form.resetFields();
        hideModal();
    };

    return (
        <div>
            <h1>Question Bank</h1>
            <Button type="primary" onClick={showModal}>
                Add Question Bank
            </Button>

            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                {paginatedData.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                        <Card
                            hoverable
                            title={item.title}
                            extra={<Tag color="blue">{item.category}</Tag>}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                <div>
                                    <strong>Questions:</strong> {item.questions}
                                </div>

                                <div>
                                    <strong>Duration:</strong> {item.duration}
                                </div>

                                <div>
                                    <strong>Total Marks:</strong> {item.totalMarks}
                                </div>

                                <div>
                                    <strong>Pass Marks:</strong> {item.passMarks}
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: 10 }}
                                >
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
                    total={questionBanks.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                />
            </div>

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
                footer={<>
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
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
                        <Input
                            size="large"
                            placeholder="Enter question bank title"
                        />
                    </Form.Item>

                    {/* Number of Questions */}
                    <Form.Item
                        label="Number of Questions"
                        name="numQuestions"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the number of questions",
                            },

                            {
                                validator(_, value) {
                                    if (typeof value === "string") {
                                        return Promise.reject(new Error('Please enter valid number of questions'))
                                    }
                                    if (value > 10) {
                                        return Promise.reject(new Error("Number of questions must be less than 10"))
                                    }
                                    return Promise.resolve()
                                }
                            }
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
                        name="time"
                        rules={[
                            {
                                required: true,
                                message: "Please enter the time duration",
                            },
                        ]}
                    >
                        <TimePicker
                            size="large"
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
                            options={categories}
                        />
                    </Form.Item>

                    {/* Total Marks */}
                    <Form.Item
                        label="Total Marks"
                        name="totalMarks"

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
                        name="passMarks"
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