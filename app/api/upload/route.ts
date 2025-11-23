import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { uploadPresignSchema } from "@/lib/validations";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const validation = uploadPresignSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    const { filename, contentType } = validation.data;

    const ctx = getRequestContext();
    
    // We need these env vars to be set
    // @ts-ignore
    const R2_ACCOUNT_ID = ctx.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
    // @ts-ignore
    const R2_ACCESS_KEY_ID = ctx.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
    // @ts-ignore
    const R2_SECRET_ACCESS_KEY = ctx.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
    // @ts-ignore
    const R2_BUCKET_NAME = ctx.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "iluli-photos";

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
       console.error("Missing R2 credentials");
       return new NextResponse("Server Configuration Error: Missing R2 Credentials", { status: 500 });
    }

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const uniqueFilename = `${Date.now()}-${filename}`;

    const signedUrl = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueFilename,
        ContentType: contentType,
      }),
      { expiresIn: 3600 }
    );

    const publicUrl = ctx.env.R2_PUBLIC_URL || "https://photos.aiboop.org";

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl,
      filename: uniqueFilename,
      fileUrl: publicUrl ? `${publicUrl}/${uniqueFilename}` : uniqueFilename,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
