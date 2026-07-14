"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  message,
  Row,
  Col,
  Alert,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/context/AuthContext";

const { Title, Text, Link } = Typography;

interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthContext();
  const [form] = Form.useForm();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onFinish = async (values: LoginFormData) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      // Error is already handled in AuthContext
      console.error("Login error:", error);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    message.error("Please check your input fields.");
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card
          variant="outlined"
          className="shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90"
          styles={{ body: { padding: "2.5rem 2rem" } }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-r from-blue-500 to-purple-500 shadow-lg mb-4">
                <LockOutlined className="text-3xl text-white" />
              </div>
            </motion.div>
            <Title level={2} className="mb-1! text-gray-800! font-bold">
              Welcome Back
            </Title>
            <Text type="secondary" className="text-base">
              Sign in to continue to your account
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            initialValues={{ remember: false }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            size="large"
            requiredMark={false}
            className="space-y-1"
          >
            <Form.Item
              name="email"
              label={
                <span className="font-medium text-gray-700">Email Address</span>
              }
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
              className="mb-5"
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="john@example.com"
                className="rounded-lg py-2.5 px-4 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="font-medium text-gray-700">Password</span>
              }
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
              className="mb-3"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="••••••••"
                className="rounded-lg py-2.5 px-4 border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                disabled={isLoading}
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-6">
              <Form.Item
                name="remember"
                valuePropName="checked"
                className="mb-0!"
              >
                <Checkbox className="text-gray-600 hover:text-blue-500 transition-colors">
                  Remember me
                </Checkbox>
              </Form.Item>

              <Link
                href="/forgot-password"
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item className="mb-4!">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                className="h-12 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-base font-semibold"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </Form.Item>

            <div className="text-center pt-2">
              <Text type="secondary" className="text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Sign up now
                </Link>
              </Text>
            </div>
          </Form>

          {/* Social Logins */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Button
                block
                className="h-11 rounded-xl border-gray-300 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
                icon={
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                }
                disabled={isLoading}
              >
                Google
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                className="h-11 rounded-xl border-gray-300 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
                icon={
                  <img
                    src="https://github.com/favicon.ico"
                    alt="GitHub"
                    className="w-5 h-5"
                  />
                }
                disabled={isLoading}
              >
                GitHub
              </Button>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
