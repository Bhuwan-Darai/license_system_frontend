"use client";
import { TinyMCEEditor } from "../Tinymce-editor";

interface TextEditorInputProps {
  // Supplied automatically when used inside an antd <Form.Item>
  value?: string;
  onChange?: (content: string) => void;
  // Legacy props
  values?: string;
  textValue?: (content: string) => void;
}

export default function TextEditor({
  value,
  onChange,
  values = "",
  textValue,
}: TextEditorInputProps) {
  return (
    <TinyMCEEditor
      value={value ?? values}
      onChange={(newContent: string) => {
        onChange?.(newContent);
        textValue?.(newContent);
      }}
      height={400}
    />
  );
}
