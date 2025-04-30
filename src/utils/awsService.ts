import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
});

export async function generateUploadUrl({ fileName, fileType }: { fileName: string; fileType: string }) {
  const key = `${Date.now()}-${fileName?.slice?.(0, 20) || ""}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType || "application/octet-stream",
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5, // URL expires in 5 minutes
  });

  return { url, key };
}
