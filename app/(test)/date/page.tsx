"use client";

import { useState } from "react";
import { Button, Form, Typography } from "antd";
import { NepaliDateField, NepaliDatePicker, formatBsDate } from "@/app/components/ui/NepaliDatePicker";

export default function Page() {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState<unknown>(null);

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ dob: "2000-04-13" }}
        onFinish={(v) => setSubmitted(v)}
      >
        <Form.Item label="Date of birth (BS picker)" name="dob" rules={[{ required: true, message: "Select a date" }]}>
          <NepaliDateField />
        </Form.Item>
        <Form.Item label="Raw NepaliDatePicker (Date value)" name="raw">
          <NepaliDatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Range" name="range">
          <NepaliDatePicker.RangePicker style={{ width: "100%" }} />
        </Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form>

      <Form.Item noStyle shouldUpdate>
        {() => (
          <Typography.Paragraph style={{ marginTop: 16 }}>
            BS of dob: {formatBsDate(form.getFieldValue("dob"), true)}
          </Typography.Paragraph>
        )}
      </Form.Item>
      <pre>{JSON.stringify(submitted, null, 2)}</pre>
    </div>
  );
}
