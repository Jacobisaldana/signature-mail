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
  } = context.env;

  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET || !S3_REGION) {
    return new Response(
      JSON.stringify({ error: "S3 configuration is missing in environment variables." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
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
        'Access-Control-Allow-Origin': '*' // Adjust for your production domain if needed
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
