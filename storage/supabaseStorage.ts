import { supabase } from '../supabaseClient';

const AVATARS_BUCKET = (import.meta.env.VITE_SUPABASE_AVATARS_BUCKET as string) || 'avatars';
const ICONS_BUCKET = (import.meta.env.VITE_SUPABASE_ICONS_BUCKET as string) || 'icons';

export async function uploadAvatar(file: File, userId: string, bucket: string = AVATARS_BUCKET) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `${userId}/avatar_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(key, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return { url: data.publicUrl, key };
}

export function getIconUrlsFromSupabase(bucket: string = ICONS_BUCKET) {
  const make = (name: string) => supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  return {
    linkedin: make('linkedin.png'),
    twitter: make('twitter.png'),
    instagram: make('instagram.png'),
    facebook: make('facebook.png'),
    calendar: make('calendar.png'),
    phone: make('phone.png'),
    email: make('email.png'),
    website: make('website.png'),
  };
}

export async function listUserAvatars(userId: string, bucket: string = AVATARS_BUCKET) {
  const { data, error } = await supabase.storage.from(bucket).list(userId, {
    limit: 50,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw error;

  return (
    data?.map((file) => {
      const path = `${userId}/${file.name}`;
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
      const version = file.updated_at || file.created_at || new Date().toISOString();
      return {
        key: path,
        url: `${publicUrl.publicUrl}?v=${new Date(version).getTime()}`,
      };
    }) || []
  );
}
