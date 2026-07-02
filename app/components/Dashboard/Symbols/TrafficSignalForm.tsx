import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Select, Button, Alert, Space } from 'antd';
import { UploadOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

export interface TrafficSignal {
    id: number;
    image: string;
    nepaliText: string;
    englishText: string;
    category: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface TrafficSignalFormData {
    nepaliText: string;
    englishText: string;
    category: string;
    description?: string;
    image: string;
}

export interface PaginatedResponse {
    data: TrafficSignal[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetSignalsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}


export type CategoryType = 'all' | 'Mandatory' | 'Warning' | 'Informative' | 'Other';

export const CATEGORIES: CategoryType[] = ['all', 'Mandatory', 'Warning', 'Informative', 'Other'];


const { TextArea } = Input;
const { Option } = Select;

interface TrafficSignalFormProps {
    onSubmit: (values: TrafficSignalFormData) => void;
    loading?: boolean;
    initialValues?: Partial<TrafficSignalFormData>;
    submitText?: string;
}

function TrafficSignalForm({
                               onSubmit,
                               loading = false,
                               initialValues = {},
                               submitText = 'Add Signal'
                           }: TrafficSignalFormProps) {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || '');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (initialValues.image) {
            setImageUrl(initialValues.image);
            setFileList([{
                uid: '-1',
                name: 'signal-image',
                status: 'done',
                url: initialValues.image
            }]);
        }
    }, [initialValues.image]);

    const handleImageUpload: UploadProps['customRequest'] = ({ file, onSuccess }) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setImageUrl(url);
            form.setFieldsValue({ image: url });

            // Update file list
            setFileList([{
                uid: '-1',
                name: (file as File).name,
                status: 'done',
                url: url
            }]);

            onSuccess?.(file);
        };
        reader.readAsDataURL(file as File);
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setFileList([]);
        form.setFieldsValue({ image: '' });
    };

    const handleFinish = (values: any) => {
        onSubmit({
            ...values,
            image: imageUrl || values.image
        });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={initialValues}
            style={{ maxWidth: '100%' }}
        >
            <Form.Item
                name="nepaliText"
                label="Nepali Text"
                rules={[{ required: true, message: 'Please enter Nepali text' }]}
            >
                <Input
                    placeholder="Enter traffic signal text in Nepali (e.g., रोकिनुहोस्)"
                    prefix="🇳🇵"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="englishText"
                label="English Translation"
                rules={[{ required: true, message: 'Please enter English translation' }]}
            >
                <Input
                    placeholder="Enter English translation (e.g., Stop)"
                    prefix="🇬🇧"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
            >
                <Select placeholder="Select category" size="large">
                    {CATEGORIES.filter(c => c !== 'all').map(category => (
                        <Option key={category} value={category}>
                            {category === 'Mandatory' && '🚫 '}
                            {category === 'Warning' && '⚠️ '}
                            {category === 'Informative' && 'ℹ️ '}
                            {category === 'Other' && '📌 '}
                            {category}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
            >
                <TextArea
                    rows={3}
                    placeholder="Add a brief description (optional)"
                    maxLength={200}
                    showCount
                />
            </Form.Item>

            <Form.Item
                name="image"
                label="Signal Image"
                rules={[{ required: true, message: 'Please upload an image' }]}
            >
                <Upload
                    listType="picture-card"
                    maxCount={1}
                    customRequest={handleImageUpload}
                    accept="image/*"
                    fileList={fileList}
                    onRemove={handleRemoveImage}
                    showUploadList={{ showPreviewIcon: false }}
                >
                    {fileList.length === 0 && (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    )}
                </Upload>
            </Form.Item>

            {imageUrl && (
                <div style={{ marginBottom: '16px' }}>
                    <Alert
                        message="Image Preview"
                        description={
                            <img
                                src={imageUrl}
                                alt="Signal preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '150px',
                                    marginTop: '8px',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '4px',
                                    objectFit: 'contain'
                                }}
                            />
                        }
                        type="success"
                        showIcon
                    />
                </div>
            )}

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={!loading && <PlusOutlined />}
                    block
                    size="large"
                >
                    {submitText}
                </Button>
            </Form.Item>
        </Form>
    );
}

export default TrafficSignalForm;