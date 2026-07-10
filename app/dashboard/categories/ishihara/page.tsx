"use client";

import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import CustomTable from "@/app/components/ui/CustomTable";

import { Button, Form, Input, Modal, Space } from "antd";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;

interface IshiharaCategory {
    id: number;
    title: string;
    description: string;
}

export default function IshiharaCategories() {
    const { open, showModal, hideModal } = useModal();
    const [form] = Form.useForm();

    const [categories, setCategories] = useState<IshiharaCategory[]>([
        {
            id: 1,
            title: "Demonstration",
            description: "Practice plate shown before the color vision test.",
        },
        {
            id: 2,
            title: "Screening",
            description: "Plates used to determine whether the applicant passes the color vision screening.",
        },
        {
            id: 3,
            title: "Diagnostic",
            description: "Additional plates used when further evaluation of color vision deficiency is required.",
        },
    ]);

    const onFinish = (values: Omit<IshiharaCategory, "id">) => {
        const newCategory: IshiharaCategory = {
            id: Date.now(),
            ...values,
        };

        setCategories((prev) => [newCategory, ...prev]);

        form.resetFields();
        hideModal();
    };

    const columns: ColumnsType<IshiharaCategory> = [
        {
            title: "Category",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Action",
            key: "action",
            width: 180,
            sorter: false,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => console.log("Edit", record)}
                    >
                        Edit
                    </Button>

                    <Button
                        danger
                        type="primary"
                        onClick={() =>
                            setCategories((prev) =>
                                prev.filter((item) => item.id !== record.id)
                            )
                        }
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 20,
                }}
            >
                <Button type="primary" onClick={showModal}>
                    Add Ishihara Category
                </Button>
            </div>

            <CustomTable
                columns={columns}
                dataSource={categories}
                initialPageSize={10}
            />

            <Modal
                title={
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                        }}
                    >
                        Add Ishihara Category
                    </span>
                }
                open={open}
                footer={null}
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
                    }
                }}
                destroyOnHidden={true}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Category Name"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Please enter category name",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Enter Ishihara category"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            {
                                required: true,
                                message: "Please enter description",
                            },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            showCount
                            maxLength={250}
                            placeholder="Enter category description"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 12,
                            }}
                        >
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                    hideModal();
                                }}
                            >
                                Cancel
                            </Button>

                            <Button type="primary" htmlType="submit">
                                Save Category
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}