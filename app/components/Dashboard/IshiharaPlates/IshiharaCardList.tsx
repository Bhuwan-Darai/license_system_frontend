"use client";

import React, { useMemo, useState } from "react";
import {
    Button,
    Card,
    Col, Image,
    Modal,
    Pagination,
    Row,
    Space,
    Tag,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";

import AddIshiharaPlates from "@/app/components/Dashboard/IshiharaPlates/IshiharaAddForm";
import useModal from "@/app/hooks/useModalHook";
import { useQueryIshihara } from "./useQueryIshihara";

type IshiharaPlate = {
    id: number;
    title: string;
    imageType: string;
    image_url: string;
};

export default function IshiharaCardList() {
    const [currentPage, setCurrentPage] = useState(1);
    const { open, showModal, hideModal } = useModal();
     const { plates, isLoading } = useQueryIshihara();

    return (
        <>
            <Row justify="end" style={{ marginBottom: 20 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                >
                    Add Ishihara Plate
                </Button>
            </Row>

            <Row gutter={[16, 16]}>
                {plates?.data?.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                        <Card
                            hoverable
                            cover={
                                <Image
                                    src={item.image_url}
                                    alt={item.title}
                                    draggable={false}
                                    style={{
                                        height: 220,
                                        objectFit: "cover",
                                    }}
                                />
                            }
                        >
                            <Space
                                orientation="vertical"
                                size={8}
                                style={{ width: "100%" }}
                            >
                                <strong>{item.title}</strong>

                                <Tag color="blue">{item.imageType}</Tag>

                                <Space style={{ width: "100%" }}>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        block
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        block
                                    >
                                        Delete
                                    </Button>
                                </Space>
                            </Space>
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
                    current={plates?.pagination?.page}
                    pageSize={plates?.pagination?.limit}
                    total={plates?.pagination?.total_pages}
                    showSizeChanger={false}
                    onChange={setCurrentPage}
                />
            </div>

            <Modal
                title="Add Ishihara Plate"
                open={open}
                onCancel={hideModal}
                footer={null}
                destroyOnHidden={true}
                centered
            >
                <AddIshiharaPlates />
            </Modal>
        </>
    );
}