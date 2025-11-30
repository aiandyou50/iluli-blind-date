import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { uploadPresignSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const validation = uploadPresignSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ error: "Validation Error", details: validation.error.format() }, { status: 400 });
    }

    const { filename, contentType } = validation.data;

    const ctx = getRequestContext();
    
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

    // Use userId in path as per SPEC recommendation for organization
    // But keep unique filename to avoid cache issues or overwrites if multiple uploads
    const uniqueFilename = `${session.user.id}/${Date.now()}-${filename}`;

    const signedUrl = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: uniqueFilename,
        ContentType: contentType,
        // Enforce 10MB limit via content-length-range in policy if possible, 
        // but here we are just signing a PUT. 
        // Client should respect the limit.
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({ 
      url: signedUrl, 
      key: uniqueFilename,
      publicUrl: `https://photos.aiboop.org/${uniqueFilename}`
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
