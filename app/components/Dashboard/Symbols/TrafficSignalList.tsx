"use client";
import { Spin, Button, Form, Input, Modal, Select, Pagination } from "antd";
import { useSignalMutation } from "./hooks/useSignalMutation";
import { useSignalQuery } from "./hooks/useSignalQuery";
import { useSignalCategoryQuery } from "./Categories/useSignalCategoryQuery";
import { PlusOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import ImageUpload from "../../ui/UploadImage";
import useModal from "@/app/hooks/useModalHook";
import TrafficSignalCard, { TrafficSignal } from "./TrafficSignalCard";
import { ImageValue } from "../VehicleCagetory/VehicleCategories";
import { useState } from "react";

type SymbolCategories = {
  ID: number;
  TrafficSignalCategoryID: string;
  Title: string;
  Description: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
};

function TrafficSignalList() {
  const [form] = Form.useForm();
  const [mode, setMode] = useState("add");
  const { open, showModal, hideModal, setOpen } = useModal();

  const { signals, isLoading, error } = useSignalQuery();
  const { categories, isLoading: categoryLoading } = useSignalCategoryQuery();

  const {
    addSignal,
    isAdding,
    updateSignal,
    isUpdating,
    deleteSignal,
    isDeleting,
  } = useSignalMutation();

  const signalsList = signals?.data || [];
  const pagination = signals?.pagination;

  const handleFinish = async (values: any) => {
    console.log("form values", values);

    if (mode === "add") {
      const payload = {
        ...values,
        image_url: values.image_url?.path,
      };
      await addSignal(payload);
    } else {
      const payload = {
        signal_id: values?.traffic_signal_id,
        signal_category: values?.signal_category,
        english_title: values?.english_title,
        title: values?.nepali_title,
        image_url: values?.image_url?.path,
        english_description: values?.english_description,
        description: values?.description,
        is_active: values?.is_active,
      };
      await updateSignal(payload);
    }
    form.resetFields();
    hideModal();
  };

  const handleEdit = (signal: TrafficSignal) => {
    setMode("edit");
    setOpen(true);

    form.setFieldsValue({
      traffic_signal_id: signal.traffic_signal_id,
      nepali_title: signal.title,
      english_title: signal.english_title,
      english_description: signal.english_description,
      description: signal.description,

      signal_category:
        signal.traffic_signal_category?.traffic_signal_category_id,

      image_url: {
        url: signal.image_url,
        path: signal.image_path,
      },
    });
  };

  const handleDelete = async (id: string) => {
    console.log("Deleting signal:", id);
    await deleteSignal(id);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "12px",
        }}
      >
        <Button
          onClick={() => {
            form.resetFields();
            setMode("add");
            showModal();
          }}
          type="primary"
          icon={<PlusOutlined />}
        >
          Add Traffic Signals
        </Button>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: "500px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "12px",
            alignContent: "start",
            opacity: categoryLoading ? 0.6 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {signalsList?.map((signal: TrafficSignal) => (
            <TrafficSignalCard
              key={signal.id}
              signal={signal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={false}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          paddingBottom: 8,
        }}
      >
        <Pagination
          current={pagination?.page || 1}
          pageSize={pagination?.limit || 12}
          total={pagination?.total || 0}
          showSizeChanger
          pageSizeOptions={["12", "24", "48", "96"]}
        />
      </div>
      <Modal
        open={open}
        onOk={() => hideModal()}
        onCancel={() => hideModal()}
        title="Add Traffic Signal"
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              width: "100%",
            }}
          >
            <Button
              type="default"
              onClick={() => hideModal()}
              disabled={isAdding}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={form.submit}
              loading={isAdding}
              size="large"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ maxWidth: "100%" }}
        >
          <Form.Item name="traffic_signal_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="nepali_title"
            label="Nepali Text"
            rules={[{ required: true, message: "Please enter Nepali text" }]}
          >
            <Input
              placeholder="Enter traffic signal text in Nepali (e.g., रोकिनुहोस्)"
              prefix="🇳🇵"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="english_title"
            label="English Translation"
            rules={[
              { required: true, message: "Please enter English translation" },
            ]}
          >
            <Input
              placeholder="Enter English translation (e.g., Stop)"
              prefix="🇬🇧"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="english_description"
            label="English Description"
            rules={[
              {
                required: true,
                message: "Please enter English description",
              },
            ]}
          >
            <TextArea
              placeholder="Enter English description (e.g., Stop at red light)"
              rows={2}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Nepali Description"
            rules={[
              { required: true, message: "Please enter Nepali description" },
            ]}
          >
            <TextArea
              placeholder="Enter Nepali description (e.g., रातो बत्ती बलेको बेला रोकिनुहोस्)"
              rows={2}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="signal_category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              showSearch={{ optionFilterProp: "label" }}
              placeholder="Select a category"
              options={categories?.map((b: SymbolCategories) => ({
                value: b.TrafficSignalCategoryID,
                label: b.Title,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="image_url"
            label="Signal Image"
            rules={[{ required: true, message: "Please upload an image" }]}
          >
            <ImageUpload
              value={form.getFieldValue("image_url") as ImageValue}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TrafficSignalList;
