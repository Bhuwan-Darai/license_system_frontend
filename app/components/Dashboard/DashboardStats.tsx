"use client";

import React from "react";
import { Card, Col, Result, Row, Skeleton, Statistic, Typography } from "antd";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import NepalRegistrationMap from "./NepalRegistrationMap";
import { DayPoint, useDashboardStats } from "./useDashboardStats";

const { Text } = Typography;

interface TileProps {
  title: string;
  total: number;
  /** extra lines such as "Active 5" */
  details?: { label: string; value: number; color?: string }[];
}

const Tile: React.FC<TileProps> = ({ title, total, details }) => (
  <Card size="small" style={{ height: "100%" }}>
    <Statistic title={title} value={total} />
    {details && (
      <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {details.map((d) => (
          <Text key={d.label} style={{ fontSize: 12, color: d.color }} type={d.color ? undefined : "secondary"}>
            {d.label}: <b>{d.value}</b>
          </Text>
        ))}
      </div>
    )}
  </Card>
);

const GREEN = "#52c41a";
const RED = "#ff4d4f";

const DayChart: React.FC<{ title: string; data: DayPoint[]; color: string }> = ({ title, data, color }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <Card size="small" title={title} extra={<Text type="secondary">Last 30 days: {total}</Text>}>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={11} minTickGap={16} />
            <YAxis allowDecimals={false} fontSize={11} />
            <Tooltip labelFormatter={(d) => String(d)} formatter={(v) => [v, title]} />
            <Bar dataKey="count" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const DashboardStats: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { data, isLoading, error } = useDashboardStats(enabled);

  if (error) return <Result status="warning" title="Could not load dashboard statistics" />;
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 8 }} />;

  const c = data.counts;
  const tiles: TileProps[] = [
    { title: "Roles", total: c.roles_total },
    {
      title: "Users",
      total: c.panel_users + c.app_users,
      details: [
        { label: "Staff", value: c.panel_users },
        { label: "App users", value: c.app_users },
      ],
    },
    {
      title: "Questions",
      total: c.questions_total,
      details: [
        { label: "Active", value: c.questions_active, color: GREEN },
        { label: "Inactive", value: c.questions_inactive, color: RED },
      ],
    },
    {
      title: "Blogs",
      total: c.blogs_total,
      details: [
        { label: "Published", value: c.blogs_published, color: GREEN },
        { label: "Draft", value: c.blogs_draft },
      ],
    },
    {
      title: "Ishihara plates",
      total: c.ishihara_total,
      details: [
        { label: "Active", value: c.ishihara_active, color: GREEN },
        { label: "Inactive", value: c.ishihara_inactive, color: RED },
      ],
    },
    {
      title: "Exams",
      total: c.exams_total,
      details: [
        { label: "Active", value: c.exams_active, color: GREEN },
        { label: "Inactive", value: c.exams_inactive, color: RED },
      ],
    },
    {
      title: "Carousels",
      total: c.carousels_total,
      details: [
        { label: "Shown", value: c.carousels_shown, color: GREEN },
        { label: "Hidden", value: c.carousels_hidden, color: RED },
      ],
    },
    { title: "Registrations", total: c.registrations_total },
    {
      title: "Inquiries",
      total: c.inquiries_total,
      details: [{ label: "New", value: c.inquiries_new, color: "#1677ff" }],
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]}>
        {tiles.map((t) => (
          <Col key={t.title} xs={24} sm={12} lg={8} xl={6}>
            <Tile {...t} />
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={12}>
          <DayChart title="Registrations" data={data.registrations_per_day} color="#1677ff" />
        </Col>
        <Col xs={24} xl={12}>
          <DayChart title="Inquiries" data={data.inquiries_per_day} color="#fa8c16" />
        </Col>
      </Row>
      <div style={{ marginTop: 16 }}>
        <NepalRegistrationMap counts={data.registrations_by_district} />
      </div>
    </>
  );
};

export default DashboardStats;
