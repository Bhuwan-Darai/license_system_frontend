"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Steps,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";

import ImageUpload from "@/app/components/ui/UploadImage";
import {
  Province,
  RegistrationDetail,
  RegistrationPayload,
  useMutationRegistration,
} from "./useRegistration";

const { Text } = Typography;

type ImageValue = { url: string; path: string };

type FormValues = {
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  date_of_birth: Dayjs;
  gender: string;
  blood_group?: string;
  father_name: string;
  mother_name?: string;
  citizenship_no: string;
  license_category: string;
  province: string;
  district: string;
  municipality?: string;
  ward_no?: number | null;
  address?: string;
  license_front_image?: ImageValue;
  license_back_image?: ImageValue;
  passport_photo?: ImageValue;
};

// Nepal DoTM license categories
const LICENSE_CATEGORIES = [
  { value: "A", label: "A - Motorcycle" },
  { value: "B", label: "B - Car / Jeep / Van" },
  { value: "C", label: "C - Three wheeler" },
  { value: "C1", label: "C1 - Tempo / Three wheeler (small)" },
  { value: "D", label: "D - Power tiller / Tractor" },
  { value: "E", label: "E - Heavy machinery" },
  { value: "F", label: "F - Heavy machinery (tracked)" },
  { value: "G", label: "G - Road roller" },
  { value: "H", label: "H - Small tractor" },
  { value: "I", label: "I - Tractor" },
  { value: "J1", label: "J1 - Pickup / Mini truck" },
  { value: "J2", label: "J2 - Heavy truck" },
  { value: "K", label: "K - Scooter" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((v) => ({
  value: v,
  label: v,
}));

// The fields each step owns; only these are validated when moving on.
const STEPS: { title: string; fields: (keyof FormValues)[] }[] = [
  { title: "Account", fields: ["full_name", "email", "phone", "password"] },
  {
    title: "License details",
    fields: [
      "date_of_birth",
      "gender",
      "father_name",
      "mother_name",
      "citizenship_no",
      "blood_group",
      "license_category",
    ],
  },
  { title: "Address", fields: ["province", "district", "municipality", "ward_no", "address"] },
  { title: "Photos", fields: ["license_front_image", "license_back_image", "passport_photo"] },
];

const asImage = (url: string, path: string): ImageValue | undefined =>
  path ? { url, path } : undefined;

const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" } as const;

interface Props {
  open: boolean;
  /** When set the form edits this registration, otherwise it creates one. */
  editing: RegistrationDetail | null;
  provinces: Province[];
  onClose: () => void;
}

const RegistrationForm: React.FC<Props> = ({ open, editing, provinces, onClose }) => {
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const { createRegistration, updateRegistration, isCreating, isUpdating } = useMutationRegistration();

  const [current, setCurrent] = useState(0);
  // values collected from every step, shown in the confirmation before submitting
  const [review, setReview] = useState<FormValues | null>(null);

  const province = Form.useWatch("province", form);
  const districts = provinces.find((p) => p.name === province)?.districts ?? [];

  useEffect(() => {
    if (!open) return;
    setCurrent(0);
    setReview(null);
    if (editing) {
      form.setFieldsValue({
        full_name: editing.full_name,
        email: editing.email,
        phone: editing.phone,
        password: undefined,
        date_of_birth: dayjs(editing.date_of_birth),
        gender: editing.gender,
        blood_group: editing.blood_group || undefined,
        father_name: editing.father_name,
        mother_name: editing.mother_name,
        citizenship_no: editing.citizenship_no,
        license_category: editing.license_category,
        province: editing.province,
        district: editing.district,
        municipality: editing.municipality,
        ward_no: editing.ward_no,
        address: editing.address,
        license_front_image: asImage(editing.license_front_image, editing.license_front_image_path),
        license_back_image: asImage(editing.license_back_image, editing.license_back_image_path),
        passport_photo: asImage(editing.passport_photo, editing.passport_photo_path),
      });
    } else {
      form.resetFields();
    }
  }, [open, editing, form]);

  const last = current === STEPS.length - 1;

  const next = async () => {
    try {
      await form.validateFields(STEPS[current].fields);
      setCurrent((c) => c + 1);
    } catch {
      // the fields show their own error messages
    }
  };

  // Steps that are not on screen are unmounted, but their values stay in the
  // form store, so getFieldsValue(true) returns everything entered so far.
  const openReview = async () => {
    try {
      await form.validateFields(STEPS[current].fields);
    } catch {
      return;
    }
    setReview(form.getFieldsValue(true) as FormValues);
  };

  const submit = async () => {
    if (!review) return;
    const v = review;
    const payload: RegistrationPayload = {
      full_name: v.full_name,
      email: v.email,
      phone: v.phone,
      password: v.password || undefined,
      date_of_birth: v.date_of_birth.format("YYYY-MM-DD"),
      gender: v.gender,
      blood_group: v.blood_group ?? "",
      father_name: v.father_name,
      mother_name: v.mother_name ?? "",
      citizenship_no: v.citizenship_no,
      license_category: v.license_category,
      province: v.province,
      district: v.district,
      municipality: v.municipality ?? "",
      ward_no: v.ward_no ?? null,
      address: v.address ?? "",
      license_front_image: v.license_front_image?.path ?? "",
      license_back_image: v.license_back_image?.path ?? "",
      passport_photo: v.passport_photo?.path ?? "",
    };
    try {
      if (editing) {
        await updateRegistration({ id: editing.registration_id, payload });
        messageApi.success("Registration updated successfully.");
      } else {
        await createRegistration(payload);
        messageApi.success("Registration created. The customer can now log in to the mobile app.");
      }
      setReview(null);
      onClose();
    } catch (e) {
      // keep the review open so nothing typed is lost; the user can go back and fix it
      const err = e as { response?: { data?: { message?: string } } };
      messageApi.error(err.response?.data?.message ?? "Failed to save the registration.");
    }
  };

  const required = (label: string) => [{ required: true, message: `Please enter ${label}` }];

  const categoryLabel = (code?: string) => LICENSE_CATEGORIES.find((c) => c.value === code)?.label ?? code;
  const genderLabel = (g?: string) => (g ? g.charAt(0) + g.slice(1).toLowerCase() : "");

  const photo = (label: string, img?: ImageValue, width = 150) => (
    <div style={{ textAlign: "center" }}>
      {img ? <Image src={img.url} alt={label} width={width} style={{ borderRadius: 8 }} /> : null}
      <div>
        <Text type="secondary">{label}</Text>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <Modal
        title={editing ? "Edit Registration" : "New License Registration"}
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        centered
        destroyOnHidden
        maskClosable={false}
        styles={{ body: { maxHeight: "75vh", overflowY: "auto", paddingRight: 8 } }}
      >
        <Steps
          size="small"
          current={current}
          items={STEPS.map((s) => ({ title: s.title }))}
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" requiredMark="optional" preserve>
          {current === 0 && (
            <div style={grid}>
              <Form.Item label="Full name" name="full_name" rules={[...required("the full name"), { max: 100 }]}>
                <Input />
              </Form.Item>
              <Form.Item
                label="Email (used to log in)"
                name="email"
                rules={[...required("the email"), { type: "email", message: "Enter a valid email" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Phone" name="phone" rules={[...required("the phone number"), { max: 50 }]}>
                <Input />
              </Form.Item>
              <Form.Item
                label={editing ? "New password (leave empty to keep)" : "Password"}
                name="password"
                rules={[
                  { required: !editing, message: "Please enter a password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </div>
          )}

          {current === 1 && (
            <div style={grid}>
              <Form.Item
                label="Date of birth"
                name="date_of_birth"
                rules={[{ required: true, message: "Select the date of birth" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(d) => d.isAfter(dayjs().subtract(16, "year"))}
                />
              </Form.Item>
              <Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Select the gender" }]}>
                <Select
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Father's name" name="father_name" rules={[...required("the father's name"), { max: 150 }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Mother's name" name="mother_name" rules={[{ max: 150 }]}>
                <Input />
              </Form.Item>
              <Form.Item
                label="Citizenship number"
                name="citizenship_no"
                rules={[...required("the citizenship number"), { max: 50 }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Blood group" name="blood_group">
                <Select allowClear options={BLOOD_GROUPS} />
              </Form.Item>
              <Form.Item
                label="License category"
                name="license_category"
                rules={[{ required: true, message: "Select the license category" }]}
              >
                <Select showSearch optionFilterProp="label" options={LICENSE_CATEGORIES} />
              </Form.Item>
            </div>
          )}

          {current === 2 && (
            <>
              <div style={grid}>
                <Form.Item label="Province" name="province" rules={[{ required: true, message: "Select the province" }]}>
                  <Select
                    showSearch
                    options={provinces.map((p) => ({ value: p.name, label: p.name }))}
                    onChange={() => form.setFieldValue("district", undefined)}
                  />
                </Form.Item>
                <Form.Item label="District" name="district" rules={[{ required: true, message: "Select the district" }]}>
                  <Select
                    showSearch
                    disabled={!province}
                    placeholder={province ? "Select district" : "Select a province first"}
                    options={districts.map((d) => ({ value: d, label: d }))}
                  />
                </Form.Item>
                <Form.Item label="Municipality" name="municipality" rules={[{ max: 100 }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Ward no." name="ward_no">
                  <InputNumber min={1} max={35} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              <Form.Item label="Address / Tole" name="address" rules={[{ max: 255 }]}>
                <Input />
              </Form.Item>
            </>
          )}

          {current === 3 && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Form.Item
                label="License - front"
                name="license_front_image"
                rules={[{ required: true, message: "Upload the front of the license" }]}
              >
                <ImageUpload width={200} height={130} />
              </Form.Item>
              <Form.Item
                label="License - back"
                name="license_back_image"
                rules={[{ required: true, message: "Upload the back of the license" }]}
              >
                <ImageUpload width={200} height={130} />
              </Form.Item>
              <Form.Item
                label="Passport size photo"
                name="passport_photo"
                rules={[{ required: true, message: "Upload the passport size photo" }]}
              >
                <ImageUpload width={130} height={160} />
              </Form.Item>
            </div>
          )}
        </Form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <div style={{ display: "flex", gap: 12 }}>
            {current > 0 && <Button onClick={() => setCurrent((c) => c - 1)}>Back</Button>}
            {last ? (
              <Button type="primary" onClick={openReview}>
                Submit
              </Button>
            ) : (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* confirmation: shows everything entered, the API is only called on OK */}
      <Modal
        title={editing ? "Confirm changes" : "Confirm registration"}
        open={!!review}
        onCancel={() => setReview(null)}
        onOk={submit}
        okText={editing ? "Save changes" : "Confirm & register"}
        cancelText="Go back"
        confirmLoading={isCreating || isUpdating}
        width={760}
        centered
        maskClosable={false}
        destroyOnHidden
        styles={{ body: { maxHeight: "70vh", overflowY: "auto", paddingRight: 8 } }}
      >
        {review && (
          <>
            <Descriptions title="Mobile app account" column={{ xs: 1, md: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Full name">{review.full_name}</Descriptions.Item>
              <Descriptions.Item label="Email (login)">{review.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{review.phone}</Descriptions.Item>
              <Descriptions.Item label="Password">
                {review.password ? "Will be set" : "Unchanged"}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="License details" column={{ xs: 1, md: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Date of birth">{review.date_of_birth?.format("YYYY-MM-DD")}</Descriptions.Item>
              <Descriptions.Item label="Gender">{genderLabel(review.gender)}</Descriptions.Item>
              <Descriptions.Item label="Father's name">{review.father_name}</Descriptions.Item>
              <Descriptions.Item label="Mother's name">{review.mother_name || "—"}</Descriptions.Item>
              <Descriptions.Item label="Citizenship no.">{review.citizenship_no}</Descriptions.Item>
              <Descriptions.Item label="Blood group">{review.blood_group || "—"}</Descriptions.Item>
              <Descriptions.Item label="License category">{categoryLabel(review.license_category)}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="Address" column={{ xs: 1, md: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Province">{review.province}</Descriptions.Item>
              <Descriptions.Item label="District">{review.district}</Descriptions.Item>
              <Descriptions.Item label="Municipality">{review.municipality || "—"}</Descriptions.Item>
              <Descriptions.Item label="Ward no.">{review.ward_no ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {review.address || "—"}
              </Descriptions.Item>
            </Descriptions>

            <Text strong>Photos</Text>
            <Image.PreviewGroup>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 12, alignItems: "flex-end" }}>
                {photo("License - front", review.license_front_image, 200)}
                {photo("License - back", review.license_back_image, 200)}
                {photo("Passport size photo", review.passport_photo, 110)}
              </div>
            </Image.PreviewGroup>
          </>
        )}
      </Modal>
    </>
  );
};

export default RegistrationForm;
