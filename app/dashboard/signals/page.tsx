'use client';

import React, { useState } from 'react';
import { Layout, Typography, Button, Space, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TrafficSignalList from "@/app/components/Dashboard/Symbols/TrafficSignalList";
import AddTrafficSignalModal from "@/app/components/Dashboard/Symbols/AddTrafficSignalModal";

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


const { Header, Content } = Layout;
const { Title } = Typography;

export default function HomePage() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSignal, setEditingSignal] = useState<TrafficSignal | null>(null);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleAdd = () => {
        setEditingSignal(null);
        setIsModalVisible(true);
    };

    const handleEdit = (signal: TrafficSignal) => {
        setEditingSignal(signal);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingSignal(null);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                background: colorBgContainer,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <Space size="middle">
                    <span style={{ fontSize: '32px' }}>🚦</span>
                    <Title level={3} style={{ margin: 0 }}>
                        Traffic Signal Management
                    </Title>
                </Space>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Add Symbol
                </Button>
            </Header>

            <Content style={{ padding: '24px', background: '#f5f5f5' }}>
                <div style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '8px',
                    minHeight: 'calc(100vh - 130px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <TrafficSignalList onEdit={handleEdit} />
                </div>
            </Content>

            <AddTrafficSignalModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                initialValues={editingSignal}
                isEdit={!!editingSignal}
            />
        </Layout>
    );
}