"use client";

import React from "react";
import { Card, Checkbox, Col, Row, Space, Spin, Typography } from "antd";
import type { Permission } from "@/config/permissions";

const { Text } = Typography;

interface PermissionPickerProps {
  catalog: Permission[];
  loading?: boolean;
  /** selected permission codes (set by the Form.Item) */
  value?: string[];
  onChange?: (codes: string[]) => void;
  /** codes the signed-in user may not hand out, shown but not selectable */
  isDisabled?: (code: string) => boolean;
}

/** Groups > sub groups > permissions, with select-all at every level. */
const PermissionPicker: React.FC<PermissionPickerProps> = ({
  catalog,
  loading,
  value = [],
  onChange,
  isDisabled = () => false,
}) => {
  const selected = new Set(value);

  const setCodes = (codes: string[], checked: boolean) => {
    const next = new Set(selected);
    codes.forEach((code) => {
      // a code that cannot be granted is never added, removing is always fine
      if (checked && !isDisabled(code)) next.add(code);
      if (!checked) next.delete(code);
    });
    onChange?.([...next]);
  };

  const state = (codes: string[]) => {
    const usable = codes.filter((code) => !isDisabled(code) || selected.has(code));
    const count = usable.filter((code) => selected.has(code)).length;
    return {
      checked: usable.length > 0 && count === usable.length,
      indeterminate: count > 0 && count < usable.length,
      disabled: usable.length === 0,
    };
  };

  return (
    <Spin spinning={!!loading}>
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        {catalog.map((group) => {
          const groupCodes = group.sub_group.flatMap((s) =>
            s.permissions.map((p) => p.code),
          );
          const groupState = state(groupCodes);
          return (
            <Card
              key={group.title}
              size="small"
              title={
                <Checkbox
                  {...groupState}
                  onChange={(e) => setCodes(groupCodes, e.target.checked)}
                >
                  <Text strong>{group.title}</Text>
                </Checkbox>
              }
            >
              {group.sub_group.map((sub) => {
                const codes = sub.permissions.map((p) => p.code);
                const subState = state(codes);
                return (
                  <Row key={sub.title} gutter={[12, 8]} style={{ marginBottom: 8 }}>
                    <Col xs={24} md={7}>
                      <Checkbox
                        {...subState}
                        onChange={(e) => setCodes(codes, e.target.checked)}
                      >
                        {sub.title}
                      </Checkbox>
                    </Col>
                    <Col xs={24} md={17}>
                      <Space size={[16, 4]} wrap>
                        {sub.permissions.map((permission) => (
                          <Checkbox
                            key={permission.code}
                            checked={selected.has(permission.code)}
                            disabled={
                              isDisabled(permission.code) &&
                              !selected.has(permission.code)
                            }
                            onChange={(e) =>
                              setCodes([permission.code], e.target.checked)
                            }
                          >
                            {permission.title}
                          </Checkbox>
                        ))}
                      </Space>
                    </Col>
                  </Row>
                );
              })}
            </Card>
          );
        })}
      </Space>
    </Spin>
  );
};

export default PermissionPicker;
