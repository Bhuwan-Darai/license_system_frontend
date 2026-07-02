import React from 'react';
import { Card, Tag, Typography, Button, Popconfirm, Space, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, FileImageOutlined, ClockCircleOutlined } from '@ant-design/icons';

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

const { Title, Text, Paragraph } = Typography;

interface TrafficSignalCardProps {
    signal: TrafficSignal;
    onEdit: (signal: TrafficSignal) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

function TrafficSignalCard({ signal, onEdit, onDelete, loading = false }: TrafficSignalCardProps) {
    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            'Mandatory': 'red',
            'Warning': 'orange',
            'Informative': 'blue',
            'Other': 'default'
        };
        return colors[category] || 'default';
    };

    return (
        <Card
            hoverable
            loading={loading}
            style={{
                height: '100%',
                minHeight: '340px',
                maxWidth: '400px',
                margin: '0 auto',
                width: '100%',
                transition: 'all 0.3s ease'
            }}
            cover={
                <div style={{
                    height: '220px',
                    background: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {signal.image ? (
                        <img
                            alt={signal.englishText}
                            src={signal.image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#999;gap:8px">
                      <span style="font-size:48px">🚦</span>
                      <span style="font-size:14px">No Image Available</span>
                    </div>
                  `;
                                }
                            }}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#999'
                        }}>
                            <FileImageOutlined style={{ fontSize: '48px' }} />
                            <span style={{ fontSize: '14px' }}>No Image Available</span>
                        </div>
                    )}
                </div>
            }
            actions={[
                <Tooltip title="Edit signal" key="edit-tooltip">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(signal)}
                        key="edit"
                    >
                        Edit
                    </Button>
                </Tooltip>,
                <Popconfirm
                    key="delete"
                    title="Delete Traffic Signal"
                    description={`Are you sure you want to delete "${signal.englishText}"?`}
                    onConfirm={() => onDelete(signal.id)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okType="danger"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                    >
                        Delete
                    </Button>
                </Popconfirm>
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color={getCategoryColor(signal.category)} style={{ fontSize: '12px' }}>
                        {signal.category || 'General'}
                    </Tag>
                    <Tag color="green" style={{ fontSize: '12px' }}>
                        #{signal.id}
                    </Tag>
                </div>

                <div>
                    <Text strong style={{ fontSize: '20px', display: 'block', color: '#1a1a1a' }}>
                        {signal.nepaliText}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '16px', display: 'block' }}>
                        {signal.englishText}
                    </Text>
                </div>

                {signal.description && (
                    <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}
                    >
                        {signal.description}
                    </Paragraph>
                )}

                <Space size="small" style={{ marginTop: '4px' }}>
                    <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {new Date(signal.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Text>
                </Space>
            </div>
        </Card>
    );
}

export default TrafficSignalCard;