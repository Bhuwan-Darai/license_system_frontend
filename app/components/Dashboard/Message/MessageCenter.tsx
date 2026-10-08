"use client";

import React from "react";
import { Alert, Result, Tabs } from "antd";
import { FacebookOutlined, WhatsAppOutlined } from "@ant-design/icons";

import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import ChatPanel from "./ChatPanel";
import { useChatStatus } from "./useChat";

const MessageCenter: React.FC = () => {
  const { isAllowed } = useAuthContext();
  const canView = isAllowed(PERM.MESSAGE.VIEW);
  const { data: status } = useChatStatus();

  if (!canView) {
    return <Result status="403" title="403" subTitle="You do not have permission to view this." />;
  }

  return (
    <div style={{ padding: 24 }}>
      {status && !status.webhook && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Incoming messages are not enabled"
          description="Set META_APP_SECRET and META_VERIFY_TOKEN on the server and register the webhook URL /api/v1/public/webhooks/meta in your Meta app."
        />
      )}
      <Tabs
        defaultActiveKey="whatsapp"
        items={[
          {
            key: "whatsapp",
            label: (
              <span>
                <WhatsAppOutlined /> WhatsApp
              </span>
            ),
            children: (
              <ChatPanel
                channel="WHATSAPP"
                configured={status?.whatsapp ?? true}
                setupHint="Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID on the server (WhatsApp Business Cloud API)."
              />
            ),
          },
          {
            key: "facebook",
            label: (
              <span>
                <FacebookOutlined /> Facebook
              </span>
            ),
            children: (
              <ChatPanel
                channel="FACEBOOK"
                configured={status?.facebook ?? true}
                setupHint="Set FACEBOOK_PAGE_TOKEN on the server (page access token with pages_messaging)."
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default MessageCenter;
