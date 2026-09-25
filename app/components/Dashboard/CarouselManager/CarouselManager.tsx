"use client";

import React, { useMemo, useState } from "react";
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
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";

import type { UploadFile, UploadProps } from "antd";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/* =========================================================
   TYPES
========================================================= */

type Carousel = {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  linkText?: string;
  openNewTab: boolean;
  display: boolean;
  sortOrder: number;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialCarousels: Carousel[] = [
  {
    id: "1",
    title: "Free License Practice",
    description:
      "Prepare for your driving license written examination.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    link: "/practice",
    linkText: "Start Practice",
    openNewTab: false,
    display: true,
    sortOrder: 1,
  },

  {
    id: "2",
    title: "Driving License Registration",
    description:
      "Get help with your driving license registration.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
    link: "/services/license-registration",
    linkText: "Learn More",
    openNewTab: false,
    display: true,
    sortOrder: 2,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const CarouselManager: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [carousels, setCarousels] =
    useState<Carousel[]>(initialCarousels);

  const [search, setSearch] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [imageFileList, setImageFileList] = useState<
    UploadFile[]
  >([]);

  const [form] = Form.useForm();

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCarousels = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return [...carousels].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
    }

    return carousels
      .filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.description
            ?.toLowerCase()
            .includes(keyword) ||
          item.link?.toLowerCase().includes(keyword)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [carousels, search]);

  /* =========================================================
     RESET
  ========================================================= */

  const resetForm = () => {
    form.resetFields();

    setImageFileList([]);
    setEditingId(null);
    setIsCreating(false);
  };

  /* =========================================================
     CREATE
  ========================================================= */

  const handleCreate = () => {
    form.resetFields();

    form.setFieldsValue({
      display: true,
      openNewTab: false,
      sortOrder: carousels.length + 1,
    });

    setImageFileList([]);
    setEditingId(null);
    setIsCreating(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item: Carousel) => {
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      link: item.link,
      linkText: item.linkText,
      openNewTab: item.openNewTab,
      display: item.display,
      sortOrder: item.sortOrder,
    });

    if (item.image) {
      setImageFileList([
        {
          uid: "-1",
          name: "carousel-image",
          status: "done",
          url: item.image,
        },
      ]);
    }

    setEditingId(item.id);
    setIsCreating(true);
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList,
  }) => {
    setImageFileList(fileList);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let image = "";

      /*
       * In production:
       *
       * 1. Upload image to your backend/storage
       * 2. Get the returned URL
       * 3. Save that URL in the carousel record
       *
       * Here we use the uploaded file URL as an example.
       */

      if (imageFileList.length > 0) {
        const file = imageFileList[0];

        image =
          file.url ||
          file.thumbUrl ||
          "";
      }

      if (!image && editingId) {
        const existing = carousels.find(
          (item) => item.id === editingId
        );

        image = existing?.image || "";
      }

      if (!image) {
        messageApi.error(
          "Please upload a carousel image."
        );

        return;
      }

      const payload: Carousel = {
        id: editingId || crypto.randomUUID(),
        title: values.title,
        description: values.description,
        image,
        link: values.link,
        linkText: values.linkText,
        openNewTab: values.openNewTab ?? false,
        display: values.display ?? true,
        sortOrder: values.sortOrder ?? 1,
      };

      if (editingId) {
        setCarousels((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? payload
              : item
          )
        );

        messageApi.success(
          "Carousel updated successfully."
        );
      } else {
        setCarousels((previous) => [
          ...previous,
          payload,
        ]);

        messageApi.success(
          "Carousel created successfully."
        );
      }

      resetForm();
    } catch {
      // Ant Design validation handles the errors.
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = (id: string) => {
    setCarousels((previous) =>
      previous.filter((item) => item.id !== id)
    );

    messageApi.success(
      "Carousel deleted successfully."
    );
  };

  /* =========================================================
     DISPLAY
  ========================================================= */

  const handleDisplayChange = (
    id: string,
    display: boolean
  ) => {
    setCarousels((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              display,
            }
          : item
      )
    );
  };

  /* =========================================================
     FORM PAGE
  ========================================================= */

  if (isCreating) {
    return (
      <>
        {contextHolder}

        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: 24,
          }}
        >
          {/* HEADER */}

          <Space
            direction="vertical"
            size={4}
            style={{
              marginBottom: 24,
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={resetForm}
              style={{
                paddingLeft: 0,
              }}
            >
              Back to Carousels
            </Button>

            <Title
              level={2}
              style={{
                marginBottom: 0,
              }}
            >
              {editingId
                ? "Edit Carousel"
                : "Add Carousel"}
            </Title>

            <Text type="secondary">
              Create a carousel banner for the website.
            </Text>
          </Space>

          <Row gutter={24}>
            {/* FORM */}

            <Col xs={24} lg={14}>
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    display: true,
                    openNewTab: false,
                  }}
                >
                  {/* TITLE */}

                  <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter the carousel title.",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g. Free License Practice"
                    />
                  </Form.Item>

                  {/* DESCRIPTION */}

                  <Form.Item
                    label="Description"
                    name="description"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Enter a short description..."
                    />
                  </Form.Item>

                  {/* LINK */}

                  <Form.Item
                    label="Link"
                    name="link"
                    rules={[
                      {
                        type: "url",
                        message:
                          "Please enter a valid URL.",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<LinkOutlined />}
                      placeholder="https://example.com/page"
                    />
                  </Form.Item>

                  {/* LINK TEXT */}

                  <Form.Item
                    label="Link Button Text"
                    name="linkText"
                  >
                    <Input
                      size="large"
                      placeholder="e.g. Learn More"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    {/* SORT ORDER */}

                    <Col span={12}>
                      <Form.Item
                        label="Sort Order"
                        name="sortOrder"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter sort order.",
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          size="large"
                          style={{
                            width: "100%",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    {/* DISPLAY */}

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

                  {/* NEW TAB */}

                  <Form.Item
                    label="Open Link In New Tab"
                    name="openNewTab"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Yes"
                      unCheckedChildren="No"
                    />
                  </Form.Item>

                  {/* ACTIONS */}

                  <Row justify="end">
                    <Space>
                      <Button onClick={resetForm}>
                        Cancel
                      </Button>

                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                      >
                        {editingId
                          ? "Update Carousel"
                          : "Create Carousel"}
                      </Button>
                    </Space>
                  </Row>
                </Form>
              </Card>
            </Col>

            {/* IMAGE */}

            <Col xs={24} lg={10}>
              <Card title="Carousel Image">
                <Upload
                  listType="picture-card"
                  fileList={imageFileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {imageFileList.length >= 1
                    ? null
                    : (
                      <div>
                        <UploadOutlined />

                        <div
                          style={{
                            marginTop: 8,
                          }}
                        >
                          Upload
                        </div>
                      </div>
                    )}
                </Upload>

                <Text type="secondary">
                  Recommended: 1600 × 600px
                </Text>
              </Card>

              {/* PREVIEW */}

              {imageFileList.length > 0 && (
                <Card
                  title="Preview"
                  style={{
                    marginTop: 24,
                  }}
                >
                  <Image
                    width="100%"
                    src={
                      imageFileList[0].url ||
                      imageFileList[0].thumbUrl
                    }
                    preview
                  />
                </Card>
              )}
            </Col>
          </Row>
        </div>
      </>
    );
  }

  /* =========================================================
     LIST PAGE
  ========================================================= */

  return (
    <>
      {contextHolder}

      <div
        style={{
          padding: 24,
        }}
      >
        {/* HEADER */}

        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 24,
          }}
        >
          <Col>
            <Title
              level={2}
              style={{
                marginBottom: 4,
              }}
            >
              Carousel Manager
            </Title>

            <Text type="secondary">
              Manage banners displayed on your website.
            </Text>
          </Col>

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

        {/* SEARCH */}

        <Card
          style={{
            marginBottom: 24,
          }}
        >
          <Input.Search
            allowClear
            size="large"
            placeholder="Search carousel..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </Card>

        {/* LIST */}

        {filteredCarousels.length === 0 ? (
          <Card>
            <Empty description="No carousels found">
              <Button
                type="primary"
                onClick={handleCreate}
              >
                Add Carousel
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredCarousels.map((item) => (
              <Col
                xs={24}
                lg={12}
                key={item.id}
              >
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
                        width="100%"
                        height={220}
                        style={{
                          objectFit: "cover",
                        }}
                      />

                      {/* SORT ORDER */}

                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                        }}
                      >
                        <Tag color="blue">
                          #{item.sortOrder}
                        </Tag>
                      </div>

                      {/* STATUS */}

                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                        }}
                      >
                        <Tag
                          color={
                            item.display
                              ? "green"
                              : "default"
                          }
                        >
                          {item.display
                            ? "Displayed"
                            : "Hidden"}
                        </Tag>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      key="preview"
                      onClick={() =>
                        window.open(
                          item.link || "#",
                          item.openNewTab
                            ? "_blank"
                            : "_self"
                        )
                      }
                    >
                      Open
                    </Button>,

                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      key="edit"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      Edit
                    </Button>,

                    <Popconfirm
                      key="delete"
                      title="Delete carousel?"
                      description="This action cannot be undone."
                      onConfirm={() =>
                        handleDelete(item.id)
                      }
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{
                        danger: true,
                      }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{
                      width: "100%",
                    }}
                  >
                    {/* TITLE */}

                    <div>
                      <Title
                        level={4}
                        style={{
                          marginBottom: 6,
                        }}
                      >
                        {item.title}
                      </Title>

                      {item.description && (
                        <Text type="secondary">
                          {item.description}
                        </Text>
                      )}
                    </div>

                    {/* LINK */}

                    {item.link && (
                      <div>
                        <Text type="secondary">
                          Link
                        </Text>

                        <div
                          style={{
                            marginTop: 4,
                          }}
                        >
                          <Text
                            ellipsis
                            style={{
                              display: "block",
                            }}
                          >
                            <LinkOutlined />{" "}
                            {item.link}
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* FOOTER */}

                    <Row
                      justify="space-between"
                      align="middle"
                    >
                      <Col>
                        {item.linkText && (
                          <Tag color="blue">
                            {item.linkText}
                          </Tag>
                        )}
                      </Col>

                      <Col>
                        <Switch
                          size="small"
                          checked={item.display}
                          onChange={(checked) =>
                            handleDisplayChange(
                              item.id,
                              checked
                            )
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
      </div>
    </>
  );
};

export default CarouselManager;