"use client";

import { use } from "react";
import BlogEditor from "@/app/components/Dashboard/Blog/BlogEditor";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BlogEditor blogId={id} />;
}
