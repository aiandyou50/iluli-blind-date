import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2 } from "@/lib/r2";
import { auth } from "@/lib/auth"; // We need to create this helper or use NextAuth directly
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  // TODO: Add authentication check here
  // const session = await auth();
  // if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { filename, contentType } = await req.json();
    const uniqueFilename = `${Date.now()}-${filename}`;

    const signedUrl = await getSignedUrl(
      R2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFilename,
        ContentType: contentType,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({
      uploadUrl: signedUrl,
      fileUrl: `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
