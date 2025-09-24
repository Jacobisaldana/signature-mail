import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// This function will run on the server, not in the browser.
// It securely uses environment variables to connect to your S3 bucket.
export async function onRequest(context) {
  const {
    S3_ENDPOINT,
    S3_ACCESS_KEY,
    S3_SECRET_KEY,
    S3_BUCKET,
    S3_REGION,
    S3_PUBLIC_BASE,
  } = context.env;

  // If bucket is public and a public base URL is provided, return stable URLs (recommended for email).
  if (S3_PUBLIC_BASE && S3_BUCKET) {
    const base = `${S3_PUBLIC_BASE.replace(/\/$/, '')}`; // e.g., https://minio.example.com/bucket
    const urls = {
      linkedin: `${base}/linkedin.png`,
      twitter: `${base}/twitter.png`,
      instagram: `${base}/instagram.png`,
      facebook: `${base}/social.png`,
      calendar: `${base}/calendar.png`,
    };
    return new Response(JSON.stringify(urls), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  }

  // Fallback: generate presigned URLs (not ideal for email as they expire).
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET) {
    return new Response(
      JSON.stringify({ error: "S3 configuration is incomplete. Provide S3_PUBLIC_BASE or full S3 credentials." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
  });

  const iconKeys = {
    linkedin: "linkedin.png",
    twitter: "twitter.png",
    instagram: "instagram.png",
    facebook: "social.png",
  };

  try {
    const urls = {};
    for (const [name, key] of Object.entries(iconKeys)) {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });
      // Generate a pre-signed URL that expires in 1 hour
      urls[name] = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    return new Response(JSON.stringify(urls), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error("Error generating signed URLs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate signed URLs for icons." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
