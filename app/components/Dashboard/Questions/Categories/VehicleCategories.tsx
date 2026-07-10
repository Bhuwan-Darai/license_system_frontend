"use client";

import { useState } from "react";
import useModal from "@/app/hooks/useModalHook";
import ImageUpload from "@/app/components/ui/UploadImage";
import CustomTable from "@/app/components/ui/CustomTable";

import { Button, Form, Image, Input, Modal, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;

interface VehicleCategory {
    id: number;
    title: string;
    description: string;
    image?: string;
}

export default function VehicleCategories() {
    const { open, showModal, hideModal } = useModal();
    const [form] = Form.useForm();

    const [categories, setCategories] = useState<VehicleCategory[]>([
        {
            id: 1,
            title: "Motorcycle",
            description: "Two-wheeled motor vehicles including scooters and bikes.",
            image: "https://picsum.photos/100?random=11",
        },
        {
            id: 2,
            title: "Car",
            description: "Private and commercial four-wheeled passenger vehicles.",
            image: "https://picsum.photos/100?random=12",
        },
        {
            id: 3,
            title: "Bus",
            description: "Passenger buses used for public and private transportation.",
            image: "https://picsum.photos/100?random=13",
        },
        {
            id: 4,
            title: "Truck",
            description: "Heavy-duty vehicles used for transporting goods.",
            image: "https://picsum.photos/100?random=14",
        },
    ]);

    const onFinish = (values: Omit<VehicleCategory, "id">) => {
        const newCategory: VehicleCategory = {
            id: Date.now(),
            ...values,
        };

        setCategories((prev) => [newCategory, ...prev]);

        form.resetFields();
        hideModal();
    };

    const columns: ColumnsType<VehicleCategory> = [
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 120,
            sorter: false,
            render: (image: string) =>
                image ? (
                    <Image
                        src={image}
                        width={60}
                        height={60}
                        style={{
                            objectFit: "cover",
                            borderRadius: 8,
                        }}
                    />
                ) : (
                    <Tag>No Image</Tag>
                ),
        },
        {
            title: "Vehicle Category",
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
                    Add Vehicle Category
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
                        Add Vehicle Category
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
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Vehicle Category"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: "Please enter vehicle category name",
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Enter vehicle category"
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
                            placeholder="Enter vehicle category description"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Category Image"
                        name="image"
                        rules={[
                            {
                                required: true,
                                message: "Please upload category image",
                            },
                        ]}
                    >
                        <ImageUpload />
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