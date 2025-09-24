import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function badRequest(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return badRequest('Method not allowed', 405);
  }

  const { S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, S3_REGION, S3_PUBLIC_BASE } = env;
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET) {
    return badRequest('S3 configuration missing');
  }
  if (!S3_PUBLIC_BASE) {
    return badRequest('Set S3_PUBLIC_BASE to your public bucket base URL');
  }

  let body: { contentType?: string; extension?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const contentType = body.contentType || 'application/octet-stream';
  let ext = body.extension || '';
  if (!ext) {
    if (contentType === 'image/png') ext = 'png';
    else if (contentType === 'image/jpeg' || contentType === 'image/jpg') ext = 'jpg';
    else if (contentType === 'image/gif') ext = 'gif';
    else if (contentType === 'image/webp') ext = 'webp';
    else ext = 'bin';
  }

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 10);
  const key = `uploads/${y}/${m}/${d}/${rand}.${ext}`;

  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION || 'us-east-1',
    credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
    forcePathStyle: true,
  });

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
  } catch (err) {
    console.error('Error creating presigned URL:', err);
    return new Response(JSON.stringify({ error: 'Failed to create upload URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const base = S3_PUBLIC_BASE.replace(/\/$/, '');
  const publicUrl = `${base}/${key}`;

  return new Response(JSON.stringify({ uploadUrl, publicUrl, key, contentType }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

