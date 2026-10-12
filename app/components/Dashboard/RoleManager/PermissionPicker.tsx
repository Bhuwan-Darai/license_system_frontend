"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Empty,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
  theme,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
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

const EMPTY: string[] = [];

/** Groups > sub groups > permissions, with search, counts and select-all at every level. */
const PermissionPicker: React.FC<PermissionPickerProps> = ({
  catalog,
  loading,
  value = EMPTY,
  onChange,
  isDisabled = () => false,
}) => {
  const { token } = theme.useToken();
  const [query, setQuery] = useState("");
  const [openKeys, setOpenKeys] = useState<string[] | null>(null);

  const selected = useMemo(() => new Set(value), [value]);

  const allCodes = useMemo(
    () =>
      catalog.flatMap((g) =>
        g.sub_group.flatMap((s) => s.permissions.map((p) => p.code)),
      ),
    [catalog],
  );
  const selectableCodes = allCodes.filter((code) => !isDisabled(code));

  // search keeps a group when its title, a sub group or a permission matches
  const needle = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!needle) return catalog;
    const hit = (text: string) => text.toLowerCase().includes(needle);
    return catalog.flatMap((group) => {
      if (hit(group.title)) return [group];
      const subs = group.sub_group.flatMap((sub) => {
        if (hit(sub.title)) return [sub];
        const permissions = sub.permissions.filter((p) => hit(p.title));
        return permissions.length ? [{ ...sub, permissions }] : [];
      });
      return subs.length ? [{ ...group, sub_group: subs }] : [];
    });
  }, [catalog, needle]);

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
      count,
      total: usable.length,
    };
  };

  // until the user toggles a panel: open the groups that already have a selection
  const defaultOpen = catalog
    .filter((g) =>
      g.sub_group.some((s) => s.permissions.some((p) => selected.has(p.code))),
    )
    .map((g) => g.title);
  const activeKey = needle
    ? visible.map((g) => g.title)
    : (openKeys ?? defaultOpen);

  const selectedCount = allCodes.filter((code) => selected.has(code)).length;

  return (
    <Spin spinning={!!loading}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Input
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search permissions"
          style={{ flex: "1 1 220px", maxWidth: 360 }}
        />
        <Tag color={selectedCount > 0 ? "blue" : "default"} style={{ margin: 0 }}>
          {selectedCount} of {allCodes.length} selected
        </Tag>
        <Space size={4} style={{ marginLeft: "auto" }}>
          <Button size="small" onClick={() => setCodes(selectableCodes, true)}>
            Select all
          </Button>
          <Button
            size="small"
            disabled={selectedCount === 0}
            onClick={() => onChange?.([])}
          >
            Clear
          </Button>
          <Button
            size="small"
            type="text"
            onClick={() =>
              setOpenKeys(activeKey.length ? [] : catalog.map((g) => g.title))
            }
          >
            {activeKey.length ? "Collapse all" : "Expand all"}
          </Button>
        </Space>
      </div>

      {visible.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={catalog.length ? "No permission matches your search" : "No permissions"}
        />
      ) : (
        <Collapse
          size="small"
          activeKey={activeKey}
          onChange={(keys) => setOpenKeys(Array.isArray(keys) ? keys : [keys])}
          items={visible.map((group) => {
            const groupCodes = group.sub_group.flatMap((s) =>
              s.permissions.map((p) => p.code),
            );
            const groupState = state(groupCodes);
            return {
              key: group.title,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Checkbox
                    checked={groupState.checked}
                    indeterminate={groupState.indeterminate}
                    disabled={groupState.disabled}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCodes(groupCodes, e.target.checked)}
                  />
                  <Text strong>{group.title}</Text>
                  <Tag
                    color={groupState.count > 0 ? "blue" : "default"}
                    style={{ margin: 0 }}
                  >
                    {groupState.count}/{groupState.total}
                  </Tag>
                </div>
              ),
              children: group.sub_group.map((sub, index) => {
                const codes = sub.permissions.map((p) => p.code);
                const subState = state(codes);
                return (
                  <div
                    key={sub.title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 200px) 1fr",
                      gap: "8px 16px",
                      padding: "10px 0",
                      borderTop:
                        index === 0
                          ? undefined
                          : `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Checkbox
                      checked={subState.checked}
                      indeterminate={subState.indeterminate}
                      disabled={subState.disabled}
                      onChange={(e) => setCodes(codes, e.target.checked)}
                    >
                      <Text strong style={{ fontSize: 13 }}>
                        {sub.title}
                      </Text>
                    </Checkbox>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sub.permissions.map((permission) => {
                        const on = selected.has(permission.code);
                        const locked = isDisabled(permission.code) && !on;
                        return (
                          <Checkbox
                            key={permission.code}
                            checked={on}
                            disabled={locked}
                            onChange={(e) =>
                              setCodes([permission.code], e.target.checked)
                            }
                            style={{
                              margin: 0,
                              padding: "2px 10px",
                              borderRadius: token.borderRadius,
                              border: `1px solid ${
                                on ? token.colorPrimaryBorder : token.colorBorderSecondary
                              }`,
                              background: on ? token.colorPrimaryBg : "transparent",
                            }}
                          >
                            {permission.title}
                          </Checkbox>
                        );
                      })}
                    </div>
                  </div>
                );
              }),
            };
          })}
        />
      )}
    </Spin>
  );
};

export default PermissionPicker;
