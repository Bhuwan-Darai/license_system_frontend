"use client";

import { useEffect, useRef } from "react";
import { uploadAndGetUrl } from "../utils/supabase";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  menubar?: boolean;
  plugins?: string[];
  toolbar?: string;
}

interface IEditor {
  getContent: (args?: any) => string;
  setContent: (content: string) => void;
  on: (event: string, callback: () => void) => void;
  remove: () => void;
}

interface ITinyMCE {
  init: (options: {
    target: HTMLElement;
    license_key?: string;
    promotion?: boolean;
    branding?: boolean;
    height?: number;
    menubar?: boolean;
    plugins?: string[];
    toolbar?: string;
    content_style?: string;
    image_title?: boolean;
    automatic_uploads?: boolean;
    file_picker_types?: string;
    images_upload_handler?: (blobInfo: { blob: () => Blob; filename: () => string }) => Promise<string>;
    file_picker_callback?: (
      callback: (url: string, meta?: { title?: string; alt?: string }) => void,
      value: string,
      meta: { filetype: string },
    ) => void;
    setup?: (editor: IEditor) => void;
  }) => void;
}

declare global {
  interface Window {
    tinymce: ITinyMCE;
  }
}

export const TinyMCEEditor = ({
  value,
  onChange,
  height = 500,
  menubar = true,
  plugins = [
    "advlist",
    "anchor",
    "autolink",
    "codesample",
    "fullscreen",
    "help",
    "image",
    "lists",
    "link",
    "media",
    "preview",
    "searchreplace",
    "table",
    "visualblocks",
    "wordcount",
  ],
  toolbar = "undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | help",
}: TinyMCEEditorProps) => {
  const editorRef = useRef<IEditor | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const initEditor = () => {
      if (textareaRef.current && window.tinymce) {
        window.tinymce.init({
          target: textareaRef.current,
          license_key: "gpl",
          promotion: false,
          branding: false,
          height,
          menubar,
          plugins,
          toolbar,
          image_title: true,
          automatic_uploads: true,
          file_picker_types: "image",
          images_upload_handler: async (blobInfo) => {
            const blob = blobInfo.blob();
            const file = new File([blob], blobInfo.filename(), {
              type: blob.type,
            });
            const uploaded = await uploadAndGetUrl(file);
            if (!uploaded) throw new Error("Image upload failed");
            return uploaded.url;
          },
          file_picker_callback: (callback, _value, meta) => {
            if (meta.filetype !== "image") return;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const uploaded = await uploadAndGetUrl(file);
              if (uploaded) callback(uploaded.url, { title: file.name });
            };
            input.click();
          },
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          setup: (editor: IEditor) => {
            editorRef.current = editor;
            editor.on("init", () => {
              editor.setContent(valueRef.current || ""); // Always set latest value
            });
            editor.on("change input undo redo", () => {
              onChangeRef.current(editor.getContent());
            });
          },
        });
      }
    };

    if (!window.tinymce) {
      script = document.createElement("script");
      script.src = "/tinymce/tinymce.min.js";
      script.async = true;
      script.onload = initEditor;
      document.head.appendChild(script);
    } else {
      initEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.remove();
      }
      // Don't remove script here; TinyMCE can be reused across forms
    };
  }, []);

  // Update editor content when `value` changes externally
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value || "");
    }
  }, [value]);

  return <textarea ref={textareaRef} />;
};
