import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const ctx = getRequestContext();
    
    // Check if the bucket binding exists
    if (!ctx.env.PHOTOS_BUCKET) {
      console.error("PHOTOS_BUCKET binding missing");
      return new NextResponse("Server Configuration Error: R2 Binding Missing", { status: 500 });
    }

    const uniqueFilename = `${Date.now()}-${file.name}`;
    
    // Upload directly to R2 via Cloudflare Binding (No AWS SDK needed)
    // Convert ReadableStream to ArrayBuffer for compatibility
    const arrayBuffer = await file.arrayBuffer();
    await ctx.env.PHOTOS_BUCKET.put(uniqueFilename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return the filename. The frontend needs to know the public domain to display it.
    // We use R2_PUBLIC_URL if available, otherwise just return the filename.
    const publicUrl = ctx.env.R2_PUBLIC_URL || ""; 

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      fileUrl: publicUrl ? `${publicUrl}/${uniqueFilename}` : uniqueFilename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
