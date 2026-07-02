"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  const imageHandler = () => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file || !quillRef.current) return;

      const imageUrl = await uploadImage(file);

      const range = quillRef.current.getSelection(true);

      quillRef.current.insertEmbed(
        range?.index ?? 0,
        "image",
        imageUrl,
        "user",
      );
    };
  };

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Write your content...",
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
          handlers: {
            image: imageHandler,
          },
        },
      },
    });

    quillRef.current = quill;

    quill.on("text-change", () => {
      onChange?.(quill.root.innerHTML);
    });
  }, [onChange]);

  useEffect(() => {
    if (!quillRef.current) return;

    const current = quillRef.current.root.innerHTML;

    if (value !== current) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  const uploadImage = async (file: File): Promise<string> => {
    console.log("Uploading", file);

    // TODO:
    // const formData = new FormData();
    // formData.append("file", file);
    // const response = await fetch("/api/upload", {
    //   method: "POST",
    //   body: formData,
    // });
    // const data = await response.json();
    // return data.url;

    return URL.createObjectURL(file);
  };

  return <div ref={editorRef} style={{ minHeight: 300 }} />;
}
