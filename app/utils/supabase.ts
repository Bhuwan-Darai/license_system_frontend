"use client";
import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { message } from "antd";

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 *
 * @param bucketName - The name of the bucket (e.g., 'avatars', 'documents', 'products')
 * @param fileObject - The File object from input[type="file"]
 * @returns Promise<string | null> - Public URL or null if upload fails
 */
export async function uploadAndGetUrl(
  bucketName: string,
  fileObject: File,
): Promise<string | null> {
  try {
    // Generate unique filename to prevent collisions
    const fileExtension =
      fileObject.name.split(".").pop()?.toLowerCase() || "png";
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
    const filePath = `uploads/${uniqueFileName}`;

    // 1. Upload file
    const response = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileObject, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite if file exists
      });

    if (response.error) {
      // console.error(
      //   `Upload failed in bucket [${bucketName}]:`,
      //   response.error.message,
      // );
      console.log("error", response.error);
      return null;
    }

    // 2. Get Public URL (for public buckets)
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Unexpected error during file upload:", error);
    return null;
  }
}

export const handleUpload = async (file: File) => {
  const url = await uploadAndGetUrl("avatars", file);
  if (url) {
    message.success("File uploaded successfully:");
  }
};
