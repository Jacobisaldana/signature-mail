import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

  if (!S3_PUBLIC_BASE || !S3_BUCKET) {
    return badRequest('Server not configured: set S3_PUBLIC_BASE and S3_BUCKET');
  }
  if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
    return badRequest('S3 credentials missing on server');
  }

  let payload: { dataUrl?: string; filename?: string };
  try {
    payload = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  if (!payload?.dataUrl) {
    return badRequest('Missing dataUrl');
  }

  // Expect a data URL like: data:image/png;base64,AAAA...
  const match = /^data:(.+);base64,(.*)$/i.exec(payload.dataUrl);
  if (!match) {
    return badRequest('Invalid dataUrl format');
  }

  const contentType = match[1];
  const base64 = match[2];
  let ext = 'bin';
  if (contentType === 'image/png') ext = 'png';
  else if (contentType === 'image/jpeg' || contentType === 'image/jpg') ext = 'jpg';
  else if (contentType === 'image/gif') ext = 'gif';
  else if (contentType === 'image/webp') ext = 'webp';

  // Decode base64
  let bytes: Uint8Array;
  try {
    const buf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    bytes = buf;
  } catch {
    return badRequest('Failed to decode base64 image');
  }

  // Optional: basic size check (max ~3MB)
  if (bytes.byteLength > 3 * 1024 * 1024) {
    return badRequest('Image too large (>3MB)');
  }

  // Create a deterministic-ish key: timestamp + random suffix
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

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const base = S3_PUBLIC_BASE.replace(/\/$/, '');
  const url = `${base}/${key}`;

  return new Response(JSON.stringify({ url, key }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

