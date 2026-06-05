"use client";

import React, { useState } from "react";
import { Button, Input, message, Typography } from "antd";

const { Title, Text } = Typography;

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 4) {
      message.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);

      // Call your API here
      console.log("OTP:", otp);

      message.success("OTP verified successfully!");
    } catch (error) {
      message.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md rounded-lg border p-6 shadow">
        <Title level={3} className="text-center">
          Verify OTP
        </Title>

        <Text type="secondary">
          Enter the 4-digit code sent to your email.
        </Text>

        <div className="mt-6">
          <Input.OTP
            length={4}
            value={otp}
            onChange={(value) => setOtp(value)}
            size="large"
            formatter={(str) => str.replace(/\D/g, "")}
          />
        </div>

        <Button
          type="primary"
          block
          className="mt-6"
          loading={loading}
          onClick={handleVerify}
        >
          Verify OTP
        </Button>

        <Button
          type="link"
          block
          onClick={() => message.success("OTP resent")}
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );
}