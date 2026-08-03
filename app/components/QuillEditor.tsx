// "use client";

// import { useEffect, useRef } from "react";
// import Quill from "quill";
// import "quill/dist/quill.snow.css";
// import { uploadAndGetUrl } from "../utils/supabase";

// interface QuillEditorProps {
//   value?: string;
//   onChange?: (value: string) => void;
// }

// export default function QuillEditor({ value, onChange }: QuillEditorProps) {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const quillRef = useRef<Quill | null>(null);

//   const imageHandler = () => {
//     const input = document.createElement("input");

//     input.type = "file";
//     input.accept = "image/*";

//     input.click();

//     input.onchange = async () => {
//       const file = input.files?.[0];

//       if (!file || !quillRef.current) return;

//       const imageUrl = await uploadAndGetUrl(file);
//       console.log("imageUrl", imageUrl);

//       const range = quillRef.current.getSelection(true);

//       quillRef.current.insertEmbed(range?.index ?? 0, "image", imageUrl?.url);
//     };
//   };

//   useEffect(() => {
//     if (!editorRef.current || quillRef.current) return;

//     const quill = new Quill(editorRef.current, {
//       theme: "snow",
//       placeholder: "Write your content...",
//       modules: {
//         toolbar: {
//           container: [
//             [{ header: [1, 2, false] }],
//             ["bold", "italic", "underline"],
//             [{ list: "ordered" }, { list: "bullet" }],
//             ["link", "image"],
//             ["clean"],
//           ],
//           handlers: {
//             image: imageHandler,
//           },
//         },
//       },
//     });

//     quillRef.current = quill;

//     quill.on("text-change", () => {
//       onChange?.(quill.root.innerHTML);
//     });
//   }, [onChange]);

//   useEffect(() => {
//     if (!quillRef.current) return;

//     const current = quillRef.current.root.innerHTML;

//     if (value !== current) {
//       quillRef.current.root.innerHTML = value || "";
//     }
//   }, [value]);

//   const handleUploadImage = async (file: File): Promise<string> => {
//     console.log("Uploading", file);

//     // TODO:
//     // const formData = new FormData();
//     // formData.append("file", file);
//     // const response = await fetch("/api/upload", {
//     //   method: "POST",
//     //   body: formData,
//     // });
//     // const data = await response.json();
//     // return data.url;

//     return URL.createObjectURL(file);
//   };

//   return <div ref={editorRef} style={{ minHeight: 300 }} />;
// }

"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { uploadAndGetUrl, getImageUrl } from "../utils/supabase";

interface QuillEditorProps {
  /** HTML where every <img src> is a storage PATH (what gets persisted). */
  value?: string;
  /** Emits HTML where every <img src> is a storage PATH (never the URL). */
  onChange?: (value: string) => void;
}

// Matches every src="..." inside an <img ...> tag.
const IMG_SRC_REGEX = /<img[^>]+src="([^"]+)"/g;

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  // Bidirectional cache built as images are uploaded/resolved, so we can
  // translate the DOM's HTML both ways without re-hitting storage on every
  // keystroke.
  const pathToUrl = useRef<Map<string, string>>(new Map());
  const urlToPath = useRef<Map<string, string>>(new Map());

  const rememberMapping = (path: string, url: string) => {
    pathToUrl.current.set(path, url);
    urlToPath.current.set(url, path);
  };

  // URL -> path, for handing HTML off to the parent/backend.
  const toPathHtml = (html: string) => {
    let result = html;
    urlToPath.current.forEach((path, url) => {
      result = result.split(url).join(path);
    });
    return result;
  };

  // path -> URL, for actually rendering inside the editor.
  const toDisplayHtml = (html: string) => {
    let result = html;
    pathToUrl.current.forEach((url, path) => {
      result = result.split(path).join(url);
    });
    return result;
  };

  // Given HTML whose <img> srcs may be storage paths, resolve any we don't
  // already have a URL for, then return HTML ready to render.
  const resolveAndDisplay = async (html: string): Promise<string> => {
    if (!html) return html;

    const paths = new Set<string>();
    let match: RegExpExecArray | null;
    const regex = new RegExp(IMG_SRC_REGEX);
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      // Only resolve things we don't already know are display URLs and
      // don't already have a mapping for — avoids re-resolving on every
      // value change.
      if (!urlToPath.current.has(src) && !pathToUrl.current.has(src)) {
        paths.add(src);
      }
    }

    await Promise.all(
      Array.from(paths).map(async (path) => {
        try {
          const url = await getImageUrl(path);
          if (url) rememberMapping(path, url);
        } catch (err) {
          console.error("Failed to resolve image path", path, err);
        }
      }),
    );

    return toDisplayHtml(html);
  };

  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !quillRef.current) return;

      const uploaded = await uploadAndGetUrl(file);
      if (!uploaded?.url || !uploaded?.path) {
        console.error("Upload did not return both url and path", uploaded);
        return;
      }

      rememberMapping(uploaded.path, uploaded.url);

      const range = quillRef.current.getSelection(true);
      // Display always uses the URL — the path alone isn't loadable.
      quillRef.current.insertEmbed(range?.index ?? 0, "image", uploaded.url);
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
      // Translate display URLs back to paths — the parent only ever sees
      // paths, never the URL.
      onChange?.(toPathHtml(quill.root.innerHTML));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    let cancelled = false;

    (async () => {
      const currentAsPathHtml = toPathHtml(quillRef.current!.root.innerHTML);
      if (value === currentAsPathHtml) return;

      const displayHtml = await resolveAndDisplay(value || "");
      if (!cancelled && quillRef.current) {
        quillRef.current.root.innerHTML = displayHtml;
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <div ref={editorRef} style={{ minHeight: 300 }} />;
}
