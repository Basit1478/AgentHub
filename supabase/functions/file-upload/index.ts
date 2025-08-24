import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const file = (req as any).files?.file as File; // Access uploaded file from req.files
    
    if (!file) {
      throw new Error("No file provided");
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("user-uploads")
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabaseClient
      .from("file_uploads")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: uploadData.path,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("user-uploads")
      .getPublicUrl(uploadData.path);

    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      url: urlData.publicUrl,
      type: fileRecord.file_type,
      size: fileRecord.file_size,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message });
  }
}