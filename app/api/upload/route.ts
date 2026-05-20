// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.AWS_BUCKET!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "misc";
    const type = (formData.get("type") as string);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let buffer: any = Buffer.from(await file.arrayBuffer());
    let contentType = file.type || "image/jpeg";
    let extension = "jpg";

    if (type === "image") {
      extension = "jpg";
      contentType = "image/jpeg";
      buffer = await sharp(buffer)
        .rotate() // auto-applies EXIF rotation
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, mozjpeg: true }) // converts to JPEG with optimized compression
        .toBuffer();
    } else if (type === "video") {
      extension = "mp4";
      contentType = file.type || "video/mp4";
    } else {
      // Get extension from filename
      const parts = file.name.split(".");
      extension = parts.length > 1 ? parts[parts.length - 1] : "bin";
    }

    const key = `${folder}/${uuidv4()}.${extension}`;

    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }).promise();

    // const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;


    // Deliver uploaded files via CloudFront CDN for speed and security
    const cdnUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const url = `${cdnUrl}/${key}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("S3 upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const s3Url = req.nextUrl.searchParams.get("url");
    if (!s3Url) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const url = new URL(s3Url);
    const bucket = url.hostname.split(".")[0]; // e.g. ed-library-bucket
    const key = url.pathname.slice(1); // remove leading "/"

    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucket,
      Key: key,
      Expires: 60, // valid for 60 seconds
      ResponseContentDisposition: "attachment", // forces download
    });

    return NextResponse.json({ signedUrl });
  } catch (err: any) {
    console.error("Failed to build download URL:", err);
    return NextResponse.json({ error: err.message || "Failed to build download URL" }, { status: 500 });
  }
}
