"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Popconfirm,
  message,
} from "antd";

import {
  DeleteOutlined,
  EditOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/* =========================================================
   TYPES
========================================================= */

type EmergencyNumber = {
  id: string;
  name: string;
  number: string;
  category: string;
  description?: string;
  display: boolean;
};

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    value: "police",
    label: "Police",
  },
  {
    value: "ambulance",
    label: "Ambulance",
  },
  {
    value: "fire",
    label: "Fire Brigade",
  },
  {
    value: "traffic",
    label: "Traffic Police",
  },
  {
    value: "hospital",
    label: "Hospital",
  },
  {
    value: "disaster",
    label: "Disaster Management",
  },
  {
    value: "other",
    label: "Other",
  },
];

/* =========================================================
   MOCK DATA
========================================================= */

const initialEmergencyNumbers: EmergencyNumber[] = [
  {
    id: "1",
    name: "Nepal Police",
    number: "100",
    category: "police",
    description: "For police emergencies and immediate assistance.",
    display: true,
  },
  {
    id: "2",
    name: "Ambulance",
    number: "102",
    category: "ambulance",
    description: "For emergency medical transportation.",
    display: true,
  },
  {
    id: "3",
    name: "Fire Brigade",
    number: "101",
    category: "fire",
    description: "For fire and rescue emergencies.",
    display: true,
  },
  {
    id: "4",
    name: "Traffic Police",
    number: "103",
    category: "traffic",
    description: "For traffic-related emergencies and assistance.",
    display: true,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const EmergencyNumberManager: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [numbers, setNumbers] = useState<EmergencyNumber[]>(
    initialEmergencyNumbers
  );

  const [search, setSearch] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form] = Form.useForm();

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredNumbers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return numbers;
    }

    return numbers.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.number.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
    );
  }, [numbers, search]);

  /* =========================================================
     RESET
  ========================================================= */

  const resetForm = () => {
    form.resetFields();

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
    });

    setEditingId(null);
    setIsCreating(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item: EmergencyNumber) => {
    form.setFieldsValue({
      name: item.name,
      number: item.number,
      category: item.category,
      description: item.description,
      display: item.display,
    });

    setEditingId(item.id);
    setIsCreating(true);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        setNumbers((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...values,
                }
              : item
          )
        );

        messageApi.success(
          "Emergency number updated successfully."
        );
      } else {
        const newNumber: EmergencyNumber = {
          id: crypto.randomUUID(),
          name: values.name,
          number: values.number,
          category: values.category,
          description: values.description,
          display: values.display ?? true,
        };

        setNumbers((previous) => [
          ...previous,
          newNumber,
        ]);

        messageApi.success(
          "Emergency number added successfully."
        );
      }

      resetForm();
    } catch {
      // Ant Design handles validation errors.
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = (id: string) => {
    setNumbers((previous) =>
      previous.filter((item) => item.id !== id)
    );

    messageApi.success(
      "Emergency number deleted successfully."
    );
  };

  /* =========================================================
     DISPLAY TOGGLE
  ========================================================= */

  const handleDisplayChange = (
    id: string,
    display: boolean
  ) => {
    setNumbers((previous) =>
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
            maxWidth: 900,
            margin: "0 auto",
            padding: 24,
          }}
        >
          {/* Header */}

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
              Back to Emergency Numbers
            </Button>

            <Title
              level={2}
              style={{
                marginBottom: 0,
              }}
            >
              {editingId
                ? "Edit Emergency Number"
                : "Add Emergency Number"}
            </Title>

            <Text type="secondary">
              Add emergency contact information that will be
              displayed to users.
            </Text>
          </Space>

          {/* Form */}

          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                display: true,
              }}
            >
              <Row gutter={24}>
                {/* Name */}

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter the emergency service name.",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g. Nepal Police"
                    />
                  </Form.Item>
                </Col>

                {/* Number */}

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Emergency Number"
                    name="number"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter the emergency number.",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g. 100"
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                </Col>

                {/* Category */}

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please select a category.",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select category"
                      options={categories}
                    />
                  </Form.Item>
                </Col>

                {/* Display */}

                <Col xs={24} md={12}>
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

                {/* Description */}

                <Col span={24}>
                  <Form.Item
                    label="Description"
                    name="description"
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Describe when users should call this number."
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Actions */}

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
                      ? "Update"
                      : "Add Emergency Number"}
                  </Button>
                </Space>
              </Row>
            </Form>
          </Card>
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
        {/* Header */}

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
              Emergency Numbers
            </Title>

            <Text type="secondary">
              Manage emergency contact numbers displayed to
              users.
            </Text>
          </Col>

          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Emergency Number
            </Button>
          </Col>
        </Row>

        {/* Search */}

        <Card
          style={{
            marginBottom: 24,
          }}
        >
          <Input.Search
            allowClear
            size="large"
            placeholder="Search by name, number or category..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </Card>

        {/* Cards */}

        {filteredNumbers.length === 0 ? (
          <Card>
            <Empty description="No emergency numbers found">
              <Button
                type="primary"
                onClick={handleCreate}
              >
                Add Emergency Number
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredNumbers.map((item) => {
              const category = categories.find(
                (category) =>
                  category.value === item.category
              );

              return (
                <Col
                  xs={24}
                  sm={12}
                  lg={8}
                  xl={6}
                  key={item.id}
                >
                  <Card
                    hoverable
                    style={{
                      height: "100%",
                    }}
                    actions={[
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
                        title="Delete emergency number?"
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
                      {/* Icon + Status */}

                      <Row
                        justify="space-between"
                        align="middle"
                      >
                        <Col>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fff1f0",
                              color: "#cf1322",
                              fontSize: 22,
                            }}
                          >
                            <PhoneOutlined />
                          </div>
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

                      {/* Name */}

                      <div>
                        <Title
                          level={4}
                          style={{
                            marginBottom: 8,
                          }}
                        >
                          {item.name}
                        </Title>

                        <Tag color="blue">
                          {category?.label ||
                            item.category}
                        </Tag>
                      </div>

                      {/* Number */}

                      <div>
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: 600,
                          }}
                        >
                          {item.number}
                        </Text>
                      </div>

                      {/* Description */}

                      {item.description && (
                        <Text type="secondary">
                          {item.description}
                        </Text>
                      )}

                      {/* Status */}

                      <div>
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
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </>
  );
};

export default EmergencyNumberManager;