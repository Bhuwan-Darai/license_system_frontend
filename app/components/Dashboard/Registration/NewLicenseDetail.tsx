"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Image,
  Input,
  Result,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import RegistrationForm from "./RegistrationForm";
import {
  RegistrationStatus,
  STATUS_OPTIONS,
  useMutationRegistration,
  useQueryLocations,
  useQueryRegistration,
} from "./useRegistration";

const { Title, Text } = Typography;

const NewLicenseDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAllowed } = useAuthContext();
  const canList = isAllowed(PERM.REGISTRATION.LIST);
  const canUpdate = isAllowed(PERM.REGISTRATION.UPDATE);
  const canStatus = isAllowed(PERM.REGISTRATION.STATUS) || canUpdate;
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading, error } = useQueryRegistration(id, canList);
  const provinces = useQueryLocations(canList).data ?? [];
  const { changeStatus, isChangingStatus } = useMutationRegistration();

  const [editOpen, setEditOpen] = useState(false);
  // null means "show what is stored"; a value means the user changed it
  const [statusDraft, setStatusDraft] = useState<RegistrationStatus | null>(null);
  const [remarksDraft, setRemarksDraft] = useState<string | null>(null);

  if (!canList) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Result
        status="404"
        title="Registration not found"
        extra={
          <Button onClick={() => router.push("/dashboard/registration/new-license")}>Back to list</Button>
        }
      />
    );
  }

  const status = statusDraft ?? data.status;
  const remarks = remarksDraft ?? data.remarks;
  const dirty = status !== data.status || remarks !== data.remarks;
  const current = STATUS_OPTIONS.find((o) => o.value === data.status);

  const saveStatus = async () => {
    try {
      await changeStatus({ id: data.registration_id, status, remarks });
      setStatusDraft(null);
      setRemarksDraft(null);
      messageApi.success("Status updated successfully.");
    } catch {
      messageApi.error("Failed to update the status.");
    }
  };

  const photo = (label: string, src: string, width: number) => (
    <div style={{ textAlign: "center" }}>
      <Image src={src} alt={label} width={width} style={{ borderRadius: 8, objectFit: "cover" }} />
      <div>
        <Text type="secondary">{label}</Text>
      </div>
    </div>
  );

  const address = [data.address, data.municipality, data.ward_no ? `Ward ${data.ward_no}` : ""]
    .filter(Boolean)
    .join(", ");

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {contextHolder}

      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/dashboard/registration/new-license")}>
          Back
        </Button>
        {canUpdate && (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        )}
      </Space>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          {data.full_name}
        </Title>
        <Tag color={current?.color}>{current?.label}</Tag>
        <Tag>Category {data.license_category}</Tag>
      </div>

      <Card title="Photos" style={{ marginBottom: 16 }}>
        <Image.PreviewGroup>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
            {photo("License - front", data.license_front_image, 260)}
            {photo("License - back", data.license_back_image, 260)}
            {photo("Passport size photo", data.passport_photo, 150)}
          </div>
        </Image.PreviewGroup>
      </Card>

      <Card title="Application status" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            style={{ width: 220 }}
            value={status}
            disabled={!canStatus}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => setStatusDraft(v)}
          />
          <Input.TextArea
            rows={3}
            placeholder="Remarks (optional)"
            maxLength={1000}
            disabled={!canStatus}
            value={remarks}
            onChange={(e) => setRemarksDraft(e.target.value)}
          />
          {canStatus && (
            <Button type="primary" disabled={!dirty} loading={isChangingStatus} onClick={saveStatus}>
              Save status
            </Button>
          )}
        </Space>
      </Card>

      <Card title="Mobile app account" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Full name">{data.full_name}</Descriptions.Item>
          <Descriptions.Item label="Email (login)">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{data.phone}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="License details" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Date of birth">{data.date_of_birth}</Descriptions.Item>
          <Descriptions.Item label="Gender">{data.gender}</Descriptions.Item>
          <Descriptions.Item label="Blood group">{data.blood_group || "—"}</Descriptions.Item>
          <Descriptions.Item label="License category">{data.license_category}</Descriptions.Item>
          <Descriptions.Item label="Father's name">{data.father_name}</Descriptions.Item>
          <Descriptions.Item label="Mother's name">{data.mother_name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Citizenship no.">{data.citizenship_no}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Address" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Province">{data.province}</Descriptions.Item>
          <Descriptions.Item label="District">{data.district}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {address || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Text type="secondary">
        Registered {new Date(data.created_at).toLocaleString()} · Last updated{" "}
        {new Date(data.updated_at).toLocaleString()}
      </Text>

      <RegistrationForm
        open={editOpen}
        editing={data}
        provinces={provinces}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
};

export default NewLicenseDetail;
