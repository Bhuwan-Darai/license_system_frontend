"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Image,
  Input,
  InputNumber,
  Result,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";

import { useAuthContext } from "@/app/context/AuthContext";
import ImageUpload from "@/app/components/ui/UploadImage";
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
  const canList = isAllowed("REGISTRATION_NEW_LICENSE_LIST");
  const canUpdate = isAllowed("REGISTRATION_NEW_LICENSE_EDIT");
  const canStatus = isAllowed("REGISTRATION_NEW_LICENSE_STATUS") || canUpdate;
  const [messageApi, contextHolder] = message.useMessage();

  const { data, isLoading, error } = useQueryRegistration(id, canList);
  const provinces = useQueryLocations(canList).data ?? [];
  const { changeStatus, isChangingStatus } = useMutationRegistration();

  const [editOpen, setEditOpen] = useState(false);
  // null means "show what is stored"; a value means the user changed it
  const [statusDraft, setStatusDraft] = useState<RegistrationStatus | null>(null);
  const [remarksDraft, setRemarksDraft] = useState<string | null>(null);
  // payment proof, same idea: null means "what is stored"
  const [billDraft, setBillDraft] = useState<{ url: string; path: string } | null | undefined>(undefined);
  const [amountDraft, setAmountDraft] = useState<number | null | undefined>(undefined);

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
  const bill =
    billDraft === undefined
      ? data.payment_bill_image_path
        ? { url: data.payment_bill_image, path: data.payment_bill_image_path }
        : null
      : billDraft;
  const amount = amountDraft === undefined ? data.amount_paid : amountDraft;
  const paymentDirty =
    (billDraft !== undefined && (billDraft?.path ?? "") !== data.payment_bill_image_path) ||
    (amountDraft !== undefined && amountDraft !== data.amount_paid);
  const needsPayment = status === "PROCESSING";
  const paymentMissing = needsPayment && (!bill || !amount || amount <= 0);
  const dirty = status !== data.status || remarks !== data.remarks || paymentDirty;
  const current = STATUS_OPTIONS.find((o) => o.value === data.status);

  const saveStatus = async () => {
    if (paymentMissing) {
      messageApi.warning("Upload the bill or payment screenshot and enter the amount paid first.");
      return;
    }
    try {
      await changeStatus({
        id: data.registration_id,
        status,
        remarks,
        payment_bill_image: bill?.path || undefined,
        amount_paid: amount && amount > 0 ? amount : undefined,
      });
      setStatusDraft(null);
      setRemarksDraft(null);
      setBillDraft(undefined);
      setAmountDraft(undefined);
      messageApi.success("Status updated successfully.");
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      messageApi.error(msg || "Failed to update the status.");
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
            {photo("Citizenship / NID - front", data.license_front_image, 260)}
            {photo("Citizenship / NID - back", data.license_back_image, 260)}
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
          {(needsPayment || bill || amount) && (
            <div
              style={{
                border: `1px solid ${paymentMissing ? "#ff4d4f" : "#d9d9d9"}`,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <Text strong>Payment {needsPayment && <Text type="danger">*</Text>}</Text>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 8 }}>
                <div>
                  <div>
                    <Text type="secondary">Bill / payment screenshot</Text>
                  </div>
                  {canStatus ? (
                    <ImageUpload
                      width={200}
                      height={130}
                      value={bill ?? undefined}
                      onChange={(v) => setBillDraft(v ?? null)}
                    />
                  ) : bill ? (
                    <Image src={bill.url} alt="Payment bill" width={200} />
                  ) : (
                    <Text type="secondary">No bill uploaded</Text>
                  )}
                </div>
                <div>
                  <div>
                    <Text type="secondary">Amount paid (Rs.)</Text>
                  </div>
                  <InputNumber
                    style={{ width: 200 }}
                    min={0.01}
                    max={10000000}
                    precision={2}
                    prefix="Rs."
                    disabled={!canStatus}
                    value={amount ?? undefined}
                    onChange={(v) => setAmountDraft(v)}
                  />
                  {data.payment_recorded_at && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Recorded {new Date(data.payment_recorded_at).toLocaleString()}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
              {paymentMissing && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  The bill and the amount paid are required for Processing.
                </Text>
              )}
            </div>
          )}
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

      {data.status_history.length > 0 && (
        <Card title="Status history" style={{ marginBottom: 16 }}>
          <Timeline
            items={data.status_history.map((h) => {
              const to = STATUS_OPTIONS.find((o) => o.value === h.to_status);
              const from = STATUS_OPTIONS.find((o) => o.value === h.from_status);
              return {
                color: to?.color,
                children: (
                  <div>
                    <Space wrap>
                      {from && <Tag>{from.label}</Tag>}
                      {from && <span>→</span>}
                      <Tag color={to?.color}>{to?.label ?? h.to_status}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(h.changed_at).toLocaleString()}
                        {h.changed_by ? ` · ${h.changed_by}` : ""}
                      </Text>
                    </Space>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {h.remarks ? h.remarks : <Text type="secondary">No remarks</Text>}
                    </div>
                  </div>
                ),
              };
            })}
          />
        </Card>
      )}

      <Card title="Mobile app account" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Full name">{data.full_name}</Descriptions.Item>
          <Descriptions.Item label="Email (login)">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{data.phone}</Descriptions.Item>
          {data.contact_phone ? (
            <Descriptions.Item label="Contact phone (application)">{data.contact_phone}</Descriptions.Item>
          ) : null}
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
        <Descriptions column={{ xs: 1, md: 2 }} size="small" title="Permanent address">
          <Descriptions.Item label="Province">{data.province}</Descriptions.Item>
          <Descriptions.Item label="District">{data.district}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {address || "—"}
          </Descriptions.Item>
        </Descriptions>
        {data.current_province ? (
          <Descriptions
            column={{ xs: 1, md: 2 }}
            size="small"
            title="Current address"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Province">{data.current_province}</Descriptions.Item>
            <Descriptions.Item label="District">{data.current_district}</Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {[data.current_address, data.current_municipality, data.current_ward_no ? `Ward ${data.current_ward_no}` : ""]
                .filter(Boolean)
                .join(", ") || "—"}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
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
