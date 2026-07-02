import React, { useState } from "react";
import type { FormProps, UploadProps } from "antd";
import { Button, Form, Input, Select, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";

type FieldType = {
    title: string;
    imageType: string;
    img: any;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
};

export default function AddIshiharaPlates() {
    const [imageUrl, setImageUrl] = useState("");

    const handleChange: UploadProps["onChange"] = (info) => {
        if (info.file.originFileObj) {
            setImageUrl(URL.createObjectURL(info.file.originFileObj));
        }
    };

    const beforeUpload = () => {
        return false; // Prevent auto upload
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Form<FieldType>
            layout="vertical"
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Title"
                name="title"
                rules={[
                    {
                        required: true,
                        message: "Please input title!",
                    },
                ]}
            >
                <Input placeholder="Enter title" />
            </Form.Item>

            <Form.Item
                label="Image Type"
                name="imageType"
                rules={[
                    {
                        required: true,
                        message: "Please select image type!",
                    },
                ]}
            >
                <Select
                    showSearch
                    placeholder="Select image type"
                    optionFilterProp="label"
                    options={[
                        {
                            value: "normal",
                            label: "Normal",
                        },
                        {
                            value: "protanopia",
                            label: "Protanopia",
                        },
                        {
                            value: "deuteranopia",
                            label: "Deuteranopia",
                        },
                    ]}
                />
            </Form.Item>

            <Form.Item
                label="Image"
                name="img"
                valuePropName="fileList"
                rules={[
                    {
                        required: true,
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
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
}