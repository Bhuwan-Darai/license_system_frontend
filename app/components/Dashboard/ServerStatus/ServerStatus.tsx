"use client";

import React from "react";
import { Alert, Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { REFRESH_MS, useServerStatus } from "./useServerStatus";

const { Text } = Typography;

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 MB";
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
};

// green, then amber, then red as usage climbs
const usageColor = (percent: number) =>
  percent >= 90 ? "#ff4d4f" : percent >= 70 ? "#faad14" : "#52c41a";

const clamp = (n: number) => Math.min(100, Math.max(0, n));

const UsageBar: React.FC<{ label: string; percent: number; detail?: string }> = ({
  label,
  percent,
  detail,
}) => (
  <div style={{ marginBottom: 12 }}>
    <Space style={{ width: "100%", justifyContent: "space-between" }}>
      <Text>{label}</Text>
      <Text type="secondary">{detail ?? `${percent.toFixed(1)}%`}</Text>
    </Space>
    <Progress
      percent={Number(clamp(percent).toFixed(1))}
      strokeColor={usageColor(percent)}
      showInfo={false}
      size="small"
    />
  </div>
);

export default function ServerStatus() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt } = useServerStatus();

  const online = !!data && !isError;
  const m = data?.metrics;
  const ramPercent = m && m.os.total_ram ? (m.os.ram / m.os.total_ram) * 100 : 0;

  return (
    <Card
      title="Server Status"
      loading={isLoading}
      extra={
        <Space>
          {isFetching && !isLoading && <SyncOutlined spin />}
          {online ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Online
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              Offline
            </Tag>
          )}
        </Space>
      }
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title="Cannot reach the server"
          description={
            dataUpdatedAt
              ? `Last successful check at ${new Date(dataUpdatedAt).toLocaleTimeString()}. Retrying every ${REFRESH_MS / 1000}s.`
              : `Retrying every ${REFRESH_MS / 1000}s.`
          }
        />
      )}

      {m && data && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Statistic title="Response time" value={data.latency} suffix="ms" />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Active connections" value={m.os.conns} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="App connections" value={m.pid.conns} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Load average" value={m.os.load_avg} precision={2} />
            </Col>
          </Row>

          <Row gutter={[32, 0]}>
            <Col xs={24} md={12}>
              <Text strong>Server (machine)</Text>
              <div style={{ marginTop: 8 }}>
                <UsageBar label="CPU" percent={m.os.cpu} />
                <UsageBar
                  label="Memory"
                  percent={ramPercent}
                  detail={`${formatBytes(m.os.ram)} / ${formatBytes(m.os.total_ram)}`}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>API process</Text>
              <div style={{ marginTop: 8 }}>
                <UsageBar label="CPU" percent={m.pid.cpu} />
                <UsageBar
                  label="Memory"
                  percent={m.os.total_ram ? (m.pid.ram / m.os.total_ram) * 100 : 0}
                  detail={formatBytes(m.pid.ram)}
                />
              </div>
            </Col>
          </Row>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Updated {data.checkedAt.toLocaleTimeString()}, refreshes every{" "}
            {REFRESH_MS / 1000}s
          </Text>
        </>
      )}
    </Card>
  );
}
