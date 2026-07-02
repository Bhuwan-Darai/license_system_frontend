"use client";

import { useState } from "react";
import { Image, Upload, message, Spin } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

interface ImageUploadProps {
  value?: string;
  onChange?: (url?: string) => void;

  accept?: string[];
  width?: number;
  height?: number;
}

export default function ImageUpload({
  value,
  onChange,
  width = 160,
  height = 160,
  accept = ["image/jpeg", "image/png"],
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  /**
   * Later:
   *
   * const formData = new FormData();
   * formData.append("file", file);
   *
   * const res = await uploadToMinio(formData);
   *
   * return res.url;
   */

  const uploadImage = async (file: File): Promise<string> => {
    console.log("Uploading...", file);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO
    // upload to MinIO and return URL

    return URL.createObjectURL(file);
  };

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!accept.includes(file.type)) {
      message.error(
        `Only ${accept
          .map((x) => x.replace("image/", "").toUpperCase())
          .join(", ")} files are allowed`
      );

      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB");
      return Upload.LIST_IGNORE;
    }

    try {
      setLoading(true);

      const url = await uploadImage(file as RcFile);

      onChange?.(url);

      message.success("Uploaded successfully");
    } catch {
      message.error("Upload failed");
    } finally {
      setLoading(false);
    }

    return false;
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  };

  if (value) {
    return (
      <div
        style={{
          ...containerStyle,
          border: "1px solid #f0f0f0",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={value}
          width={width}
          height={height}
          preview={false}
          style={{
            objectFit: "cover",
          }}
        />

        {/* Hover overlay with actions */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: "rgba(0, 0, 0, 0.45)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <EyeOutlined
            style={{ color: "#fff", fontSize: 18, cursor: "pointer" }}
            onClick={() => setPreviewOpen(true)}
          />
          <DeleteOutlined
            style={{ color: "#fff", fontSize: 18, cursor: "pointer" }}
            onClick={() => onChange?.(undefined)}
          />
        </div>

        {/* Single controlled preview, decoupled from the thumbnail image above */}
        <div style={{ display: "none" }}>
          <Image
            src={value}
            preview={{
              visible: previewOpen,
              src: value,
              onVisibleChange: (visible) => setPreviewOpen(visible),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Upload
      accept={accept.join(",")}
      showUploadList={false}
      beforeUpload={beforeUpload}
    >
      <div
        style={{
          ...containerStyle,
          border: "1px dashed #d9d9d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "#4096ff")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "#d9d9d9")
        }
      >
        {loading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
        ) : (
          <div style={{ textAlign: "center", color: "#8c8c8c" }}>
            <PlusOutlined style={{ fontSize: 20 }} />
            <div style={{ marginTop: 8, fontSize: 12 }}>Upload Image</div>
          </div>
        )}
      </div>
    </Upload>
  );
}