"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Image,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useModal from "@/app/hooks/useModalHook";
import { useQueryIshihara } from "./useQueryIshihara";
import { useMutationIshihara } from "./useMutationIshihara";
import { ImageValue } from "../VehicleCagetory/VehicleCategories";
import ImageUpload from "../../ui/UploadImage";
import { useQueryIshiharaCategory } from "./Category/useQueryIshiharaCategory";
import { getImageUrl } from "@/app/utils/supabase";

type Category = {
  ishihara_category_id: string;
  title: string;
};

export type IshiharaPlate = {
  id: number;
  plate_id: string;
  ishihara_category: Category;
  title: string;
  image_url: string;
  image_path: string;
  created_at: string;
  updated_at: string;
  is_active: string;
};

export interface IshiharaPlateFormValues {
  title: string;
  ishihara_category?: string;
  image?: ImageValue;
}

export interface CreateIshiharaPlatePayload {
  plate_id?: string;
  title: string;
  ishihara_category?: string;
  image_url?: string;
}

type IshiharaCategory = {
  ID: number;
  IshiharaCategoryID: string;
  Title: string;
  Description: string;
  Image: string;
  ImagePath: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
};

export default function IshiharaCardList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { open, showModal, hideModal } = useModal();
  const { plates, isLoading: isPlateLoading } = useQueryIshihara();
  const [form] = Form.useForm();
  const {
    addPlate,
    updatePlate,
    deletePlate,
    isAdding,
    isUpdating,
    isDeleting,
    setEditingPlate,
    editingPlate,
  } = useMutationIshihara();
  const { categories, isLoading: isCategoryLoading } =
    useQueryIshiharaCategory();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure to delete this plate?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await deletePlate(id);
          hideModal();
        } catch (error) {
          // Error already handled in onError
        }
      },
    });
  };

  const handleEdit = async (value: IshiharaPlate) => {
    console.log("value", value);
    showModal();
    setMode("edit");
    setSelectedId(value?.plate_id);
    const url = await getImageUrl(value.image_path);
    form.setFieldsValue({
      title: value?.title,
      plate_id: value?.plate_id,
      ishihara_category: value?.ishihara_category?.ishihara_category_id,
      image: {
        url: url,
        path: value.image_path,
      },
    });
  };

  const onFinish = async (values: IshiharaPlateFormValues) => {
    console.log("Form values:", values);
    const payload: CreateIshiharaPlatePayload = {
      ...values,
      image_url: values.image?.path || undefined, // only send new image if uploaded
    };

    try {
      if (mode === "edit" && selectedId) {
        await updatePlate({ id: selectedId, payload });
        hideModal();
        form.resetFields();
      } else {
        await addPlate(payload);
        hideModal();
        form.resetFields();
      }
    } catch (error) {
      // Error already handled in onError
    }
  };

  return (
    <>
      <Row justify="end" style={{ marginBottom: 20 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setMode("add");
            form.resetFields();
            showModal();
          }}
        >
          Add Ishihara Plate
        </Button>
      </Row>

      <Spin spinning={isPlateLoading}>
        {plates?.data?.length ? (
          <>
            <Row gutter={[16, 16]}>
              {plates.data.map((item: IshiharaPlate) => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                  <Card
                    hoverable
                    cover={
                      item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          draggable={false}
                          preview={false}
                          style={{
                            height: 220,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 220,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#8c8c8c",
                          }}
                        >
                          No Image
                        </div>
                      )
                    }
                  >
                    <Space
                      orientation="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <strong>{item.title}</strong>

                      <Tag color="blue">{item.ishihara_category?.title}</Tag>

                      <Space style={{ width: "100%" }}>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          block
                          onClick={() => {
                            handleEdit(item);
                            showModal();
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          disabled={isDeleting}
                          loading={isDeleting}
                          block
                          onClick={() => handleDelete(item.plate_id)}
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
                current={currentPage}
                pageSize={plates.pagination.limit}
                total={plates.pagination.total}
                showSizeChanger={false}
                onChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <Empty description="No Ishihara Plates found" />
          </div>
        )}
      </Spin>

      <Modal
        title="Add Ishihara Plate"
        open={open}
        onCancel={hideModal}
        footer={null}
        destroyOnHidden={true}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          {mode === "edit" && (
            <Form.Item name="plate_id" hidden>
              <Input />
            </Form.Item>
          )}
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="ishihara_category"
            label="Category"
            rules={[
              {
                required: true,
                message: "Please select a Category",
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Search category to Select"
              loading={isCategoryLoading}
              getPopupContainer={() => document.body}
              options={categories?.map((c: IshiharaCategory) => ({
                value: c.IshiharaCategoryID,
                label: c.Title,
              }))}
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
            <ImageUpload value={form.getFieldValue("image") as ImageValue} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mode === "edit" ? isUpdating : isAdding}
            >
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
