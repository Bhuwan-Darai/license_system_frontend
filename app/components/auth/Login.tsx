"use client";

import React from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useAuthMutation } from "./useAuthMutation";
import { useRouter } from "next/navigation";

type FieldType = {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  remember?: boolean;
};

export const Login = () => {
  const { registerUser, isPending } = useAuthMutation();
  const router = useRouter();

  const [form] = Form.useForm();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    try {
      const response = await registerUser({
        email: values.email!,
        username: values.username!,
        password: values.password!,
      });

      if (response?.data?.success) {
        message.success(response.data.message || "Registration successful!");

        form.resetFields();

        router.push("/auth/verify");
      } else {
        message.error(response?.data?.message || "Registration failed.");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed. Please try again.",
      );
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
      {/* Email */}
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input />
      </Form.Item>

      {/* Username */}
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input />
      </Form.Item>

      {/* Password */}
      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          {
            min: 6,
            message: "Password must be at least 6 characters",
          },
        ]}
      >
        <Input.Password />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
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

      {/* Remember Me */}
      <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      {/* Submit */}
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Register
        </Button>
      </Form.Item>
    </Form>
  );
};
