"use client";
import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { message } from "antd";
export interface UploadResult {
  url: string;
  path: string;
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const bucketName = "license";

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 *
 * @param bucketName - The name of the bucket (e.g., 'avatars', 'documents', 'products')
 * @param fileObject - The File object from input[type="file"]
 * @returns Promise<string | null> - Public URL or null if upload fails
 */
export async function uploadAndGetUrl(
  fileObject: File,
): Promise<UploadResult | null> {
  try {
    const fileExtension =
      fileObject.name.split(".").pop()?.toLowerCase() || "png";

    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExtension}`;

    const filePath = `vehicle/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileObject, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const handleUpload = async (file: File) => {
  const url = await uploadAndGetUrl(file);
  if (url) {
    message.success("File uploaded successfully:");
  }
};

export const handleDelete = async (path: string) => {
  await supabase.storage.from("license").remove([path]);
};

export const getImageUrl = async (path: string): Promise<string> => {
  const { data } = await supabase.storage.from(bucketName).getPublicUrl(path);

  return data.publicUrl;
};
