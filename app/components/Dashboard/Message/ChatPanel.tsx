"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Spin,
  Typography,
  message as antMessage,
} from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";

import { useAuthContext } from "@/app/context/AuthContext";
import { PERM } from "@/config/permissions";
import {
  Channel,
  ChatMessage,
  Conversation,
  useChatMutations,
  useConversations,
  useThread,
} from "./useChat";

const { Text } = Typography;

const BRAND: Record<Channel, string> = { WHATSAPP: "#25D366", FACEBOOK: "#1877F2" };

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString();
};

const title = (c: Conversation) =>
  c.contact_name || (c.channel === "WHATSAPP" ? `+${c.external_id}` : `Facebook user ${c.external_id.slice(-4)}`);

interface Props {
  channel: Channel;
  configured: boolean;
  setupHint: string;
}

const ChatPanel: React.FC<Props> = ({ channel, configured, setupHint }) => {
  const { isAllowed } = useAuthContext();
  const canSend = isAllowed(PERM.MESSAGE.SEND);
  const [api, contextHolder] = antMessage.useMessage();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newForm] = Form.useForm<{ phone: string; body: string }>();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const conversations = useConversations(channel, debounced);
  const thread = useThread(selected);
  const { sendMessage, isSending, startChat, isStarting } = useChatMutations();

  // keep the newest message in view
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = thread.data?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, selected]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !selected) return;
    setDraft("");
    try {
      await sendMessage({ conversationId: selected, body });
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      api.error(err.response?.data?.message ?? "Failed to send the message.");
    }
  };

  const handleStart = async (values: { phone: string; body: string }) => {
    try {
      await startChat({ channel, external_id: values.phone, body: values.body });
      api.success("Message sent.");
      setNewOpen(false);
      newForm.resetFields();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      api.error(err.response?.data?.message ?? "Failed to start the chat.");
    }
  };

  const items: Conversation[] = conversations.data ?? [];
  const messages: ChatMessage[] = thread.data?.messages ?? [];
  const current = thread.data?.conversation;

  return (
    <div>
      {contextHolder}
      {!configured && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`${channel === "WHATSAPP" ? "WhatsApp" : "Facebook"} sending is not set up yet`}
          description={setupHint}
        />
      )}

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 280px)",
          minHeight: 420,
          border: "1px solid rgba(128,128,128,0.25)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* conversation list */}
        <div
          style={{
            width: 300,
            borderRight: "1px solid rgba(128,128,128,0.25)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: 10, display: "flex", gap: 8 }}>
            <Input.Search
              placeholder="Search chats"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {channel === "WHATSAPP" && canSend && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: BRAND.WHATSAPP }}
                onClick={() => setNewOpen(true)}
                title="New chat"
              />
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.isLoading ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : items.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No conversations yet"
                style={{ marginTop: 40 }}
              />
            ) : (
              <List
                dataSource={items}
                renderItem={(c) => (
                  <List.Item
                    onClick={() => setSelected(c.conversation_id)}
                    style={{
                      cursor: "pointer",
                      padding: "10px 12px",
                      background:
                        selected === c.conversation_id ? "rgba(128,128,128,0.15)" : undefined,
                    }}
                  >
                    <div style={{ width: "100%", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <Text strong ellipsis>
                          {title(c)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                          {formatTime(c.last_message_at)}
                        </Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                          {c.last_message}
                        </Text>
                        {c.unread_count > 0 && (
                          <Badge count={c.unread_count} color={BRAND[channel]} />
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>

        {/* thread */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {!selected ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select a conversation"
              style={{ margin: "auto" }}
            />
          ) : (
            <>
              <div
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(128,128,128,0.25)",
                }}
              >
                <Text strong>{current ? title(current) : "…"}</Text>
                {current && channel === "WHATSAPP" && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    +{current.external_id}
                  </Text>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                {thread.isLoading ? (
                  <div style={{ textAlign: "center" }}>
                    <Spin />
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.direction === "OUT";
                    return (
                      <div
                        key={m.message_id}
                        style={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: mine ? BRAND[channel] : "rgba(128,128,128,0.18)",
                            color: mine ? "#fff" : undefined,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.body}
                          <div style={{ fontSize: 10, opacity: 0.75, textAlign: "right", marginTop: 2 }}>
                            {formatTime(m.created_at)}
                            {m.status === "FAILED" ? " · not delivered" : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {canSend ? (
                <div
                  style={{
                    padding: 10,
                    display: "flex",
                    gap: 8,
                    borderTop: "1px solid rgba(128,128,128,0.25)",
                  }}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    placeholder="Type a message (Enter to send, Shift+Enter for a new line)"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    maxLength={4000}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={isSending}
                    disabled={!draft.trim()}
                    style={{ background: BRAND[channel] }}
                    onClick={handleSend}
                  />
                </div>
              ) : (
                <Text type="secondary" style={{ padding: 10 }}>
                  You can read messages but do not have permission to send.
                </Text>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        title="New WhatsApp chat"
        open={newOpen}
        onCancel={() => setNewOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form form={newForm} layout="vertical" onFinish={handleStart}>
          <Form.Item
            label="Phone number with country code"
            name="phone"
            extra="Example: 9779800000000"
            rules={[
              { required: true, message: "Enter the phone number" },
              {
                validator: (_r, v: string) => {
                  const digits = (v ?? "").replace(/\D/g, "");
                  return digits.length >= 8 && digits.length <= 15
                    ? Promise.resolve()
                    : Promise.reject(new Error("Enter 8 to 15 digits including the country code"));
                },
              },
            ]}
          >
            <Input placeholder="9779800000000" />
          </Form.Item>
          <Form.Item
            label="Message"
            name="body"
            extra="WhatsApp only delivers free-text messages to people who wrote to you in the last 24 hours."
            rules={[{ required: true, message: "Write a message" }]}
          >
            <Input.TextArea rows={3} maxLength={4000} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isStarting}>
              Send
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatPanel;
