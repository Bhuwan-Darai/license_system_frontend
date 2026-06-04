"use client";

import React from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useAuthMutation } from "./useAuthMutation";

type FieldType = {
  username?: string;
  password?: string;
  confirmPassword?: string;
  remember?: boolean;
};

export const Login = () => {
  const { registerUser, isPending } = useAuthMutation();

  const [form] = Form.useForm();

const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
  try {
    console.log("Success:", values);

    await registerUser({
      username: values.username,
      password: values.password,
    });

    message.success("Registration successful!");
  } catch (err) {
    message.error("Registration failed. Please try again.");
  }
};

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      form={form}
      name="register"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      {/* Username */}
      <Form.Item<FieldType>
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>

      {/* Password */}
      <Form.Item<FieldType>
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item<FieldType>
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      {/* Remember */}
      <Form.Item<FieldType>
        name="remember"
        valuePropName="checked"
        label={null}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      {/* Submit */}
      <Form.Item label={null}>
        <Button type="primary" htmlType="submit" disabled={isPending}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
