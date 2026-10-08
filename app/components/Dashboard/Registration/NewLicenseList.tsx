"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Button, Modal, Result, Select, Space, Tag, Typography, message } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter, useSearchParams } from "next/navigation";

import CustomTable from "@/app/components/ui/CustomTable";
import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import api from "@/app/utils/axios";
import RegistrationForm from "./RegistrationForm";
import {
  RegistrationDetail,
  RegistrationListItem,
  RegistrationStatus,
  STATUS_OPTIONS,
  useMutationRegistration,
  useQueryLocations,
  useQueryRegistrations,
} from "./useRegistration";

const { Text } = Typography;

const NewLicenseList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.REGISTRATION.LIST);
  const canAdd = isAllowed(PERM.REGISTRATION.ADD);
  const canUpdate = isAllowed(PERM.REGISTRATION.UPDATE);
  const canDelete = isAllowed(PERM.REGISTRATION.DELETE);
  const [messageApi, contextHolder] = message.useMessage();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [province, setProvince] = useState<string | undefined>(searchParams.get("province")?.trim() || undefined);
  const [district, setDistrict] = useState<string | undefined>(searchParams.get("district")?.trim() || undefined);
  const [status, setStatus] = useState<RegistrationStatus | undefined>();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const locations = useQueryLocations(canList);
  const provinces = locations.data ?? [];
  const districts = provinces.find((p) => p.name === province)?.districts ?? [];

  const { data, isLoading, error } = useQueryRegistrations(
    { page, pageSize, search: debouncedSearch, province, district, status },
    canList,
  );
  const { deleteRegistration, isDeleting } = useMutationRegistration();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RegistrationDetail | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  // the form needs every field, so load the full record first
  const openEdit = async (id: string) => {
    try {
      const res = await api.get(`/registration/new-license/${id}`);
      setEditing(res.data.data as RegistrationDetail);
      setFormOpen(true);
    } catch {
      messageApi.error("Failed to load the registration.");
    }
  };

  const handleDelete = (record: RegistrationListItem) => {
    Modal.confirm({
      title: `Delete ${record.full_name}?`,
      content: "This also deletes the customer's mobile app account. This cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        await deleteRegistration(record.registration_id);
        if (items.length === 1 && page > 1) setPage((p) => p - 1);
        messageApi.success("Registration deleted successfully.");
      },
    });
  };

  const resetFilters = () => {
    setSearch("");
    setProvince(undefined);
    setDistrict(undefined);
    setStatus(undefined);
    setPage(1);
  };

  const items: RegistrationListItem[] = data?.data ?? [];

  const columns: ColumnsType<RegistrationListItem> = [
    {
      title: "S.N",
      key: "sn",
      width: 70,
      render: (_t, _r, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Applicant",
      key: "applicant",
      render: (_: unknown, r) => (
        <Space>
          <Avatar src={r.passport_photo || undefined} icon={<UserOutlined />} />
          <div>
            <Text strong>{r.full_name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.email}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    {
      title: "Province / District",
      key: "location",
      render: (_: unknown, r) => `${r.province} / ${r.district}`,
    },
    {
      title: "Category",
      dataIndex: "license_category",
      key: "license_category",
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s: RegistrationStatus) => {
        const opt = STATUS_OPTIONS.find((o) => o.value === s);
        return <Tag color={opt?.color}>{opt?.label ?? s}</Tag>;
      },
    },
    {
      title: "Applied",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      width: 260,
      render: (_: unknown, r) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => router.push(`/dashboard/registration/new-license/${r.registration_id}`)}
          >
            View
          </Button>
          {canUpdate && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => openEdit(r.registration_id)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button danger type="primary" icon={<DeleteOutlined />} loading={isDeleting} onClick={() => handleDelete(r)}>
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (error) return <Result title="Something went wrong" />;
  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space wrap>
          <Select
            allowClear
            showSearch
            placeholder="Province"
            style={{ width: 170 }}
            value={province}
            options={provinces.map((p) => ({ value: p.name, label: p.name }))}
            onChange={(v) => {
              setProvince(v);
              setDistrict(undefined); // a district only makes sense inside its province
              setPage(1);
            }}
          />
          <Select
            allowClear
            showSearch
            placeholder={province ? "District" : "Select a province first"}
            disabled={!province}
            style={{ width: 190 }}
            value={district}
            options={districts.map((d) => ({ value: d, label: d }))}
            onChange={(v) => {
              setDistrict(v);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 160 }}
            value={status}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </Space>

        {canAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Registration
          </Button>
        )}
      </div>

      <CustomTable
        rowKey="registration_id"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        manualPagination
        total={data?.pagination?.total ?? 0}
        currentPage={page}
        initialPageSize={pageSize}
        searchPlaceholder="Search name, phone, email or citizenship no."
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <RegistrationForm
        open={formOpen}
        editing={editing}
        provinces={provinces}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
};

export default NewLicenseList;
