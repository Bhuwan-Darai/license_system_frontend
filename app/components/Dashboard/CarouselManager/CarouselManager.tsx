"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Result,
  Row,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import ImageUpload from "../../ui/UploadImage";
import { usePageCrumb } from "@/app/context/BreadcrumbContext";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import {
  Carousel,
  useMutationCarousel,
  useQueryCarousels,
} from "./useCarousel";

const { Title, Text } = Typography;

type ImageValue = { url: string; path: string };

type CarouselFormValues = {
  title: string;
  description?: string;
  image?: ImageValue;
  link?: string;
  linkText?: string;
  openNewTab: boolean;
  display: boolean;
  sortOrder: number;
};

// Same rule as the API: web links or site-relative paths only
const isAllowedLink = (value: string) =>
  /^https?:\/\//i.test(value) || (value.startsWith("/") && !value.startsWith("//"));

const CarouselManager: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.CAROUSEL.LIST);
  const canAdd = isAllowed(PERM.CAROUSEL.ADD);
  const canUpdate = isAllowed(PERM.CAROUSEL.UPDATE);
  const canDelete = isAllowed(PERM.CAROUSEL.DELETE);
  const canDisplay = isAllowed(PERM.CAROUSEL.DISPLAY);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<CarouselFormValues>();

  const { data: carousels = [], isLoading } = useQueryCarousels(
    search.trim(),
    canList,
  );
  const {
    createCarousel,
    updateCarousel,
    setCarouselDisplay,
    deleteCarousel,
    isCreating,
    isUpdating,
    isTogglingDisplay,
  } = useMutationCarousel();

  const closeForm = () => {
    form.resetFields();
    setEditingId(null);
    setIsFormOpen(false);
  };

  usePageCrumb(
    isFormOpen ? (editingId ? "Edit Carousel" : "Add Carousel") : null,
    closeForm,
  );

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      display: true,
      openNewTab: false,
      sortOrder: Math.max(0, ...carousels.map((c) => c.sort_order)) + 1,
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Carousel) => {
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      image: { url: item.image, path: item.image_path },
      link: item.link,
      linkText: item.link_text,
      openNewTab: item.open_new_tab,
      display: item.display,
      sortOrder: item.sort_order,
    });
    setEditingId(item.carousel_id);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    let values: CarouselFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload = {
      title: values.title,
      description: values.description ?? "",
      image: values.image?.path ?? "",
      link: values.link?.trim() ?? "",
      link_text: values.linkText ?? "",
      open_new_tab: values.openNewTab ?? false,
      display: values.display ?? true,
      sort_order: values.sortOrder,
    };

    try {
      if (editingId) await updateCarousel({ id: editingId, payload });
      else await createCarousel(payload);
      closeForm();
    } catch {
      // the mutation hooks already surface the error
    }
  };

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view this."
      />
    );
  }

  /* ------------------------------ FORM PAGE ------------------------------ */

  if (isFormOpen) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={closeForm}
          style={{ paddingLeft: 0, marginBottom: 16 }}
        >
          Back to Carousels
        </Button>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ display: true, openNewTab: false }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={14}>
              <Card>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Please enter the carousel title.",
                    },
                  ]}
                >
                  <Input size="large" placeholder="e.g. Free License Practice" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter a short description..."
                  />
                </Form.Item>

                <Form.Item
                  label="Link"
                  name="link"
                  rules={[
                    {
                      validator: (_, value?: string) =>
                        !value?.trim() || isAllowedLink(value.trim())
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(
                                "Link must start with http://, https:// or /",
                              ),
                            ),
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<LinkOutlined />}
                    placeholder="https://example.com/page or /practice"
                  />
                </Form.Item>

                <Form.Item label="Link Button Text" name="linkText">
                  <Input size="large" placeholder="e.g. Learn More" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Sort Order"
                      name="sortOrder"
                      rules={[
                        { required: true, message: "Please enter sort order." },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        size="large"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Display"
                      name="display"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Visible"
                        unCheckedChildren="Hidden"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Open Link In New Tab"
                  name="openNewTab"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>

                <Row justify="end">
                  <Space>
                    <Button onClick={closeForm}>Cancel</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={isCreating || isUpdating}
                      onClick={handleSave}
                    >
                      {editingId ? "Update Carousel" : "Create Carousel"}
                    </Button>
                  </Space>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card title="Carousel Image">
                <Form.Item
                  name="image"
                  rules={[
                    { required: true, message: "Please upload a carousel image." },
                  ]}
                >
                  <ImageUpload width={320} height={120} />
                </Form.Item>
                <Text type="secondary">Recommended: 1600 × 600px</Text>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

  /* ------------------------------ LIST PAGE ------------------------------ */

  return (
    <div style={{ padding: 24 }}>
      {canAdd && (
        <Row justify="end" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Carousel
            </Button>
          </Col>
        </Row>
      )}

      <Card style={{ marginBottom: 24 }}>
        <Input.Search
          allowClear
          size="large"
          placeholder="Search carousel..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      <Spin spinning={isLoading}>
        {!isLoading && carousels.length === 0 ? (
          <Card>
            <Empty description="No carousels found">
              {canAdd && (
                <Button type="primary" onClick={handleCreate}>
                  Add Carousel
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {carousels.map((item) => (
              <Col xs={24} lg={12} key={item.carousel_id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 220,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Image
                        preview
                        src={item.image}
                        alt={item.title}
                        width="100%"
                        height={220}
                        style={{ objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: 12, left: 12 }}>
                        <Tag color="blue">#{item.sort_order}</Tag>
                      </div>
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        <Tag color={item.display ? "green" : "default"}>
                          {item.display ? "Displayed" : "Hidden"}
                        </Tag>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      key="open"
                      disabled={!item.link}
                      onClick={() =>
                        window.open(
                          item.link,
                          item.open_new_tab ? "_blank" : "_self",
                          item.open_new_tab ? "noopener,noreferrer" : undefined,
                        )
                      }
                    >
                      Open
                    </Button>,
                    canUpdate && (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      key="edit"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    ),
                    canDelete && (
                    <Popconfirm
                      key="delete"
                      title="Delete carousel?"
                      description="This action cannot be undone."
                      onConfirm={() => deleteCarousel(item.carousel_id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <Space
                    orientation="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Title level={4} style={{ marginBottom: 6 }}>
                        {item.title}
                      </Title>
                      {item.description && (
                        <Text type="secondary">{item.description}</Text>
                      )}
                    </div>

                    {item.link && (
                      <div>
                        <Text type="secondary">Link</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text ellipsis style={{ display: "block" }}>
                            <LinkOutlined /> {item.link}
                          </Text>
                        </div>
                      </div>
                    )}

                    <Row justify="space-between" align="middle">
                      <Col>
                        {item.link_text && (
                          <Tag color="blue">{item.link_text}</Tag>
                        )}
                      </Col>
                      <Col>
                        <Switch
                          size="small"
                          checked={item.display}
                          loading={isTogglingDisplay}
                          disabled={!canDisplay}
                          onChange={(checked) =>
                            setCarouselDisplay({
                              id: item.carousel_id,
                              display: checked,
                            })
                          }
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default CarouselManager;
