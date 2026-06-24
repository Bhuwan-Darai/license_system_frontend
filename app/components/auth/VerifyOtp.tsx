import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Typography, message, Alert } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const { Title, Text, Link } = Typography;

const VerifyOTP: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string[]>(Array(6).fill(""));
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValue];
    newOtp[index] = value.slice(-1);
    setOtpValue(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits) {
      const newOtp = Array(6).fill("");
      digits.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtpValue(newOtp);

      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = () => {
    const otp = otpValue.join("");
    if (otp.length < 6) {
      message.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      message.success("OTP verified successfully!");
      router.push("/dashboard");
      setLoading(false);
      console.log("OTP:", otp);
    }, 1500);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setTimeout(() => {
      message.success("OTP resent successfully!");
      setIsResending(false);
      setResendCooldown(30);
      setOtpValue(Array(6).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 1000);
  };

  const isComplete = otpValue.every((digit) => digit !== "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card
          bordered={false}
          className="shadow-2xl rounded-2xl overflow-hidden backdrop-blur-sm bg-white/90"
          styles={{ body: { padding: "2.5rem 2rem" } }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg mb-4">
                <MailOutlined className="text-3xl text-white" />
              </div>
            </motion.div>
            <Title level={2} className="!mb-1 !text-gray-800 font-bold">
              Verify OTP
            </Title>
            <Text type="secondary" className="text-base">
              We've sent a 6-digit code to
            </Text>
            <br />
            <Text strong className="text-indigo-600 text-base">
              your@email.com
            </Text>
          </div>

          <div className="mb-6">
            <Alert
              message="Check your email"
              description="Enter the 6-digit verification code sent to your email"
              type="info"
              showIcon
              className="rounded-lg bg-indigo-50 border-indigo-200"
            />
          </div>

          <Form
            name="otp-verification"
            onFinish={handleVerify}
            className="space-y-6"
          >
            <div className="flex justify-center gap-3">
              {otpValue.map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <input
                    ref={(el: any) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`
                      w-12 h-14 text-center text-xl font-bold rounded-xl border-2 
                      focus:outline-none transition-all duration-200
                      ${
                        digit
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-300 bg-white hover:border-indigo-300 focus:border-indigo-500"
                      }
                      ${isComplete ? "ring-2 ring-indigo-200" : ""}
                    `}
                    autoFocus={index === 0}
                    aria-label={`Digit ${index + 1}`}
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Text type="secondary" className="text-sm">
                Didn't receive the code?{" "}
                <Button
                  type="link"
                  className="!p-0 !h-auto text-indigo-500 hover:text-indigo-700 font-medium"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  loading={isResending}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </Button>
              </Text>
            </div>

            <Form.Item className="!mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                disabled={!isComplete}
                className="h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-base font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </Form.Item>

            <div className="flex justify-between items-center pt-2">
              <Link className="text-gray-500 hover:text-indigo-600">
                ← Back to login
              </Link>
              <Text type="secondary" className="text-xs">
                {isComplete ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircleOutlined /> Code complete
                  </span>
                ) : (
                  `Enter ${6 - otpValue.filter((d) => d !== "").length} more digit${6 - otpValue.filter((d) => d !== "").length > 1 ? "s" : ""}`
                )}
              </Text>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
