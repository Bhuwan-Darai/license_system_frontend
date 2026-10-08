"use client";

import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import { useQueryRoles } from "../RoleManager/useRole";
import {
  PanelUser,
  useMutationUser,
  useQueryUsers,
} from "./useUsers";

const PAGE_SIZE = 10;
// Select cannot hold an empty value for "no role", so super admin gets a marker
const SUPER_ADMIN = "__super_admin__";

type UserFormValues = {
  username: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
};

export default function UserManager() {
  const { user: me, isAllowed, isSuperAdmin } = useAuthContext();
  const canList = isAllowed(PERM.USER.LIST);
  const canAdd = isAllowed(PERM.USER.ADD);
  const canUpdate = isAllowed(PERM.USER.UPDATE);
  const canDelete = isAllowed(PERM.USER.DELETE);

  const [form] = Form.useForm<UserFormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PanelUser | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"ADMIN" | "USER" | undefined>();

  const { data, isLoading } = useQueryUsers(page, PAGE_SIZE, search.trim(), canList, type);
  const { data: roles = [], isLoading: isRolesLoading } = useQueryRoles(
    open && (canAdd || canUpdate),
  );
  const { createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting } =
    useMutationUser();

  const openForm = (user: PanelUser | null) => {
    setEditing(user);
    form.resetFields();
    form.setFieldsValue(
      user
        ? {
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role_id ?? SUPER_ADMIN,
          }
        : {},
    );
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = async () => {
    let values: UserFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = {
      username: values.username.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() ?? "",
      password: values.password ?? "",
      role_id: values.role === SUPER_ADMIN ? "" : values.role,
    };
    try {
      if (editing) await updateUser({ id: editing.id, payload });
      else await createUser(payload);
      closeForm();
    } catch {
      // the mutation hooks already surface the error
    }
  };

  const roleOptions = [
    ...(isSuperAdmin
      ? [{ value: SUPER_ADMIN, label: "Super Admin (full access)" }]
      : []),
    ...roles.map((role) => ({
      value: role.role_id,
      // a role with permissions the signed-in user lacks cannot be assigned
      disabled: !isSuperAdmin && !role.permissions.every((code) => isAllowed(code)),
      label: role.name,
    })),
  ];

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view users."
      />
    );
  }

  const showActions = canUpdate || canDelete;

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Input
          allowClear
          placeholder="Search by name or email..."
          prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="All accounts"
          style={{ width: 180 }}
          value={type}
          options={[
            { value: "ADMIN", label: "Staff" },
            { value: "USER", label: "App users" },
          ]}
          onChange={(v) => {
            setType(v);
            setPage(1);
          }}
        />
        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
            Add User
          </Button>
        )}
      </div>

      <Table<PanelUser>
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data ?? []}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.pagination?.total ?? 0,
          showSizeChanger: false,
          onChange: setPage,
        }}
        locale={{ emptyText: "No users found." }}
        columns={[
          { title: "Name", dataIndex: "username" },
          { title: "Email", dataIndex: "email" },
          {
            title: "Phone",
            dataIndex: "phone",
            render: (phone: string) => phone || "-",
          },
          {
            title: "Role",
            dataIndex: "role_name",
            render: (name: string, user) => (
              <Tag color={user.account_type === "USER" ? "green" : user.is_super_admin ? "gold" : "blue"}>
                {name}
              </Tag>
            ),
          },
          {
            title: "Created",
            dataIndex: "created_at",
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString(),
          },
          ...(showActions
            ? [
                {
                  title: "Actions",
                  width: 190,
                  render: (_: unknown, user: PanelUser) => (
                    // app users are customers: their account is managed through Registration
                    user.account_type === "USER" ? null : (
                    <Space>
                      {canUpdate && (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openForm(user)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && user.id !== me?.id && (
                        <Popconfirm
                          title="Delete User"
                          description="Are you sure you want to delete this user?"
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{ loading: isDeleting }}
                          onConfirm={() => deleteUser(user.id)}
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                    )
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal
        title={editing ? "Edit User" : "Add User"}
        open={open}
        width={560}
        onCancel={closeForm}
        destroyOnHidden
        okText={editing ? "Update User" : "Create User"}
        onOk={save}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Name"
            name="username"
            rules={[{ required: true, whitespace: true, message: "Enter the name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email (login)"
            name="email"
            rules={[
              { required: true, message: "Enter the email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input disabled={!!editing} autoComplete="off" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item
            label={editing ? "New password" : "Password"}
            name="password"
            extra={editing ? "Leave blank to keep the current password." : undefined}
            rules={[
              { required: !editing, message: "Enter a password" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Select a role" }]}
            // changing your own role is not allowed
            extra={
              editing && editing.id === me?.id
                ? "You cannot change your own role."
                : undefined
            }
          >
            <Select
              placeholder="Select a role"
              loading={isRolesLoading}
              options={roleOptions}
              disabled={!!editing && editing.id === me?.id}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
