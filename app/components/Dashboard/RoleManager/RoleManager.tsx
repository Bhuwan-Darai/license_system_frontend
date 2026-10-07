"use client";

import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import PermissionPicker from "./PermissionPicker";
import {
  Role,
  useMutationRole,
  useQueryPermissionCatalog,
  useQueryRoles,
} from "./useRole";

type RoleFormValues = {
  name: string;
  description?: string;
  permissions: string[];
};

export default function RoleManager() {
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.ROLE.LIST);
  const canAdd = isAllowed(PERM.ROLE.ADD);
  const canUpdate = isAllowed(PERM.ROLE.UPDATE);
  const canDelete = isAllowed(PERM.ROLE.DELETE);

  const [form] = Form.useForm<RoleFormValues>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useQueryRoles(canList);
  const { data: catalog = [], isLoading: isCatalogLoading } =
    useQueryPermissionCatalog(open);
  const { createRole, updateRole, deleteRole, isCreating, isUpdating, isDeleting } =
    useMutationRole();

  const openForm = (role: Role | null) => {
    setEditing(role);
    form.resetFields();
    form.setFieldsValue(
      role
        ? {
            name: role.name,
            description: role.description,
            permissions: role.permissions,
          }
        : { permissions: [] },
    );
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = async () => {
    let values: RoleFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      permissions: values.permissions,
    };
    try {
      if (editing) await updateRole({ id: editing.role_id, payload });
      else await createRole(payload);
      closeForm();
    } catch {
      // the mutation hooks already surface the error
    }
  };

  // Permissions the signed-in user does not hold cannot be handed out, unless the
  // role being edited already has them.
  const isDisabled = (code: string) =>
    !isAllowed(code) && !editing?.permissions.includes(code);

  if (!canList) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to view roles."
      />
    );
  }

  const showActions = canUpdate || canDelete;

  return (
    <div style={{ padding: 24 }}>
      {canAdd && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
            Add Role
          </Button>
        </div>
      )}

      <Table<Role>
        rowKey="role_id"
        loading={isLoading}
        dataSource={roles}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: "No roles yet." }}
        columns={[
          { title: "Role", dataIndex: "name" },
          {
            title: "Description",
            dataIndex: "description",
            render: (text: string) => text || "-",
          },
          {
            title: "Permissions",
            dataIndex: "permission_count",
            width: 130,
            render: (count: number) => <Tag color="blue">{count}</Tag>,
          },
          {
            title: "Users",
            dataIndex: "user_count",
            width: 100,
            render: (count: number) => <Tag>{count}</Tag>,
          },
          ...(showActions
            ? [
                {
                  title: "Actions",
                  width: 190,
                  render: (_: unknown, role: Role) => (
                    <Space>
                      {canUpdate && (
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openForm(role)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Tooltip
                          title={
                            role.user_count > 0
                              ? "Reassign the users of this role first"
                              : undefined
                          }
                        >
                          <Popconfirm
                            title="Delete Role"
                            description="Are you sure you want to delete this role?"
                            okText="Yes"
                            cancelText="No"
                            disabled={role.user_count > 0}
                            okButtonProps={{ loading: isDeleting }}
                            onConfirm={() => deleteRole(role.role_id)}
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              disabled={role.user_count > 0}
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        </Tooltip>
                      )}
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal
        title={editing ? "Edit Role" : "Add Role"}
        open={open}
        width={900}
        onCancel={closeForm}
        destroyOnHidden
        okText={editing ? "Update Role" : "Create Role"}
        onOk={save}
        confirmLoading={isCreating || isUpdating}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto", paddingRight: 8 } }}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Role name"
            name="name"
            rules={[
              { required: true, whitespace: true, message: "Enter a role name" },
              { max: 100, message: "At most 100 characters" },
            ]}
          >
            <Input placeholder="e.g. Content Editor" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>

          <Form.Item
            label="Permissions"
            name="permissions"
            rules={[
              {
                validator: (_, value?: string[]) =>
                  value && value.length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Select at least one permission")),
              },
            ]}
          >
            <PermissionPicker
              catalog={catalog}
              loading={isCatalogLoading}
              isDisabled={isDisabled}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
