// components/ui/LoadingSkeleton.tsx
"use client";

import React from "react";
import { Skeleton, Card, Row, Col } from "antd";

interface LoadingSkeletonProps {
  type?: "dashboard" | "table" | "form" | "detail";
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "dashboard",
  rows = 4,
}) => {
  if (type === "dashboard") {
    return (
      <div className="p-6">
        <Skeleton.Input active size="large" className="w-48 mb-6" />
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton.Input active size="large" className="w-48" />
          <Skeleton.Button active size="large" />
        </div>
        <Card>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="py-2 border-b border-gray-100 last:border-0"
            >
              <Skeleton active paragraph={{ rows: 0 }} />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="p-6">
        <Skeleton.Input active size="large" className="w-48 mb-6" />
        <Card>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton.Input active size="small" className="w-32 mb-1" />
              <Skeleton.Input active className="w-full" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
};

export default LoadingSkeleton;
