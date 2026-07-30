"use client";
import { useState, useEffect } from "react";
import { Button, Form, Input, Select } from "antd";
import { useMutationIshihara } from "./useMutationIshihara";
import ImageUpload from "../../ui/UploadImage";
import { ImageValue } from "../VehicleCagetory/VehicleCategories";
import { useQueryIshiharaCategory } from "./Category/useQueryIshiharaCategory";

type AddIshiharaPlatesProps = {
  editMode?: boolean;
  initialData?: {
    id?: string;
    title?: string;
    imageType?: string;
    image?: string; // existing image URL/path
  } | null;
  onSuccess?: () => void;
};

export interface IshiharaPlateFormValues {
  title: string;
  description: string;
  image?: ImageValue;
}

export interface CreateIshiharaPlatePayload {
  plate_id?: string;
  title: string;
  ishihara_category?: string;
  image_url?: string; // optional, only send if a new image is uploaded
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

export default function AddIshiharaPlates({
  editMode = false,
  initialData = null,
  onSuccess,
}: AddIshiharaPlatesProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
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
  const { categories, isLoading } = useQueryIshiharaCategory();

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (editMode && initialData) {
      form.setFieldsValue({
        title: initialData.title || "",
        ishihara_category: initialData.category_id || "",
      });

      // Set existing image preview if available
      if (initialData.image) {
        setImageUrl(initialData.image);
      }
    } else {
      form.resetFields();
      setImageUrl("");
    }
  }, [editMode, initialData, form]);

  const onFinish = async (values: IshiharaPlateFormValues) => {
    console.log("Form values:", values);
    const payload: CreateIshiharaPlatePayload = {
      ...values,
      image_url: values.image?.path || undefined, // only send new image if uploaded
    };

    try {
      if (editMode && initialData?.id) {
        await updatePlate({ id: initialData.id, payload });
      } else {
        await addPlate(payload);
      }
    } catch (error) {
      // Error already handled in onError
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      autoComplete="off"
      initialValues={{
        title: initialData?.title,
        category_id: initialData?.id,
      }}
    >
      <Form.Item name="plate_id" hidden>
        <Input />
      </Form.Item>
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
          loading={isLoading}
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
          loading={editMode ? isUpdating : isAdding}
        >
          {editMode ? "Update" : "Save"}
        </Button>
      </Form.Item>
    </Form>
  );
}
