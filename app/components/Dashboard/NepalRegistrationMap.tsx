"use client";

import React, { useMemo, useState } from "react";
import { Card, Typography } from "antd";
import { useRouter } from "next/navigation";
import { NEPAL_DISTRICTS, NEPAL_MAP_HEIGHT, NEPAL_MAP_WIDTH } from "./nepalDistricts";
import type { DistrictCount } from "./useDashboardStats";

const { Text } = Typography;

// light to dark blue as a district gets more registrations
const SHADES = ["#e6f4ff", "#bae0ff", "#91caff", "#4096ff", "#1677ff", "#0958d9"];
const NONE = "#f0f0f0";

const NepalRegistrationMap: React.FC<{ counts: DistrictCount[] }> = ({ counts }) => {
  const router = useRouter();
  const [hover, setHover] = useState<{ district: string; province: string; x: number; y: number } | null>(null);

  const byDistrict = useMemo(() => {
    const m = new Map<string, number>();
    counts.forEach((c) => m.set(`${c.province}|${c.district}`, c.count));
    return m;
  }, [counts]);
  const max = useMemo(() => Math.max(0, ...counts.map((c) => c.count)), [counts]);

  const countOf = (province: string, district: string) => byDistrict.get(`${province}|${district}`) ?? 0;

  const fill = (n: number) => {
    if (n === 0 || max === 0) return NONE;
    return SHADES[Math.min(SHADES.length - 1, Math.ceil((n / max) * SHADES.length) - 1)];
  };

  const open = (province: string, district: string) => {
    const q = new URLSearchParams({ province, district });
    router.push(`/dashboard/registration/new-license?${q.toString()}`);
  };

  const track = (e: React.MouseEvent, province: string, district: string) => {
    const box = e.currentTarget.closest("[data-map]")!.getBoundingClientRect();
    setHover({ district, province, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  return (
    <Card size="small" title="Registrations by district" extra={<Text type="secondary">Click a district to open its registrations</Text>}>
      <div data-map style={{ position: "relative", width: "100%", maxWidth: 980, margin: "0 auto" }}>
        <svg
          viewBox={`0 0 ${NEPAL_MAP_WIDTH} ${NEPAL_MAP_HEIGHT}`}
          role="img"
          aria-label="Map of Nepal showing registrations per district"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {NEPAL_DISTRICTS.map((s) => {
            const n = countOf(s.province, s.district);
            const active = hover?.district === s.district;
            return (
              <path
                key={s.district}
                d={s.d}
                fill={fill(n)}
                stroke={active ? "#ff4d4f" : "#8c8c8c"}
                strokeWidth={active ? 1.6 : 0.6}
                strokeLinejoin="round"
                tabIndex={0}
                role="link"
                aria-label={`${s.district}, ${s.province}: ${n} registrations`}
                style={{ cursor: "pointer", outline: "none" }}
                onMouseMove={(e) => track(e, s.province, s.district)}
                onMouseLeave={() => setHover(null)}
                onClick={() => open(s.province, s.district)}
                onFocus={() => setHover({ district: s.district, province: s.province, x: 12, y: 12 })}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open(s.province, s.district);
                  }
                }}
              />
            );
          })}
        </svg>

        {hover && (
          <div
            style={{
              position: "absolute",
              left: hover.x + 14,
              top: hover.y + 14,
              pointerEvents: "none",
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <b>{hover.district}</b> <span style={{ opacity: 0.7 }}>({hover.province})</span>
            <div>Registrations: {countOf(hover.province, hover.district)}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "center" }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          0
        </Text>
        {[NONE, ...SHADES].map((c) => (
          <span key={c} style={{ width: 26, height: 10, background: c, border: "1px solid #d9d9d9" }} />
        ))}
        <Text type="secondary" style={{ fontSize: 12 }}>
          {max}
        </Text>
      </div>
    </Card>
  );
};

export default NepalRegistrationMap;
