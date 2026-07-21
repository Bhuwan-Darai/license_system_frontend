"use client";
import React, { useState, useEffect } from "react";
import type { FormProps, UploadProps } from "antd";
import { Button, Form, Input, message, Select, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/app/utils/axios";

type FieldType = {
    title: string;
    imageType: string;
    img: any;
};

type AddIshiharaPlatesProps = {
    editMode?: boolean;
    initialData?: {
        id?: string;
        title?: string;
        imageType?: string;
        image?: string; // existing image URL/path
    } | null;
    onSuccess?: () => void;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
};

export default function AddIshiharaPlates({
    editMode = false,
    initialData = null,
    onSuccess,
}: AddIshiharaPlatesProps) {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [form] = Form.useForm<FieldType>();
    const queryClient = useQueryClient();

    // Reset form when initialData changes (for edit mode)
    useEffect(() => {
        if (editMode && initialData) {
            form.setFieldsValue({
                title: initialData.title || "",
                imageType: initialData.imageType || "",
            });

            // Set existing image preview if available
            if (initialData.image) {
                setImageUrl(initialData.image);
            }
        } else {
            form.resetFields();
            setImageUrl("");
        }
    }, [editMode, initialData, form]);

    // Add mutation
    const { mutateAsync: add, isPending: isAddPending } = useMutation({
        mutationFn: (payload: any) => api.post("/ishihara-plate", payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ishihara-plates"] });
            message.success("Ishihara plate added successfully!");
            form.resetFields();
            setImageUrl("");
            onSuccess?.();
        },
        onError: () => {
            message.error("Failed to add ishihara plate");
        },
    });

    // Update mutation
    const { mutateAsync: update, isPending: isUpdatePending } = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            api.put(`/ishihara-plate/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ishihara-plates"] });
            message.success("Ishihara plate updated successfully!");
            onSuccess?.();
        },
        onError: () => {
            message.error("Failed to update ishihara plate");
        },
    });

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        const payload: any = {
            title: values.title,
            imageType: values.imageType,
            image: values.img?.path || undefined, // only send new image if uploaded
        };

        try {
            if (editMode && initialData?.id) {
                await update({ id: initialData.id, payload });
            } else {
                await add(payload);
            }
        } catch (error) {
            // Error already handled in onError
        }
    };

    const handleChange: UploadProps["onChange"] = (info) => {
        const file = info.file.originFileObj;
        if (file) {
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const beforeUpload = () => false; // Prevent auto upload

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const isPending = isAddPending || isUpdatePending;

    return (
        <Form<FieldType>
            form={form}
            layout="vertical"
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            initialValues={{
                title: initialData?.title,
                imageType: initialData?.imageType,
            }}
        >
            <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please input title!" }]}
            >
                <Input placeholder="Enter title" />
            </Form.Item>

            <Form.Item
                label="Image Type"
                name="imageType"
                rules={[{ required: true, message: "Please select image type!" }]}
            >
                <Select
                    showSearch
                    placeholder="Select image type"
                    optionLabelProp="label"
                    options={[
                        { value: "normal", label: "Normal" },
                        { value: "protanopia", label: "Protanopia" },
                        { value: "deuteranopia", label: "Deuteranopia" },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="Image"
                name="img"
                valuePropName="fileList"
                rules={[
                    {
                        required: !editMode, // Only require image on add, not on edit
                        message: "Please upload an image!",
                    },
                ]}
            >
                <Upload
                    listType="picture-circle"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="preview"
                            style={{ width: "100%", borderRadius: "50%" }}
                            draggable={false}
                        />
                    ) : (
                        uploadButton
                    )}
                </Upload>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isPending}>
                    {editMode ? "Update" : "Save"}
                </Button>
            </Form.Item>
        </Form>
    );
}