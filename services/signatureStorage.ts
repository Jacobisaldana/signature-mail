import { supabase } from '../supabaseClient';
import { BrandColors, FormData, Signature, TemplateId } from '../types';

type SignatureRow = {
  id: string;
  user_id: string;
  name: string;
  label: string;
  template_id: TemplateId;
  form_data: FormData;
  colors: BrandColors;
  image_url: string | null;
  font_family: string;
  html: string;
  created_at: string;
  updated_at: string;
};

const mapSignature = (row: SignatureRow): Signature => ({
  id: row.id,
  name: row.name,
  label: row.label,
  templateId: row.template_id,
  formData: row.form_data,
  colors: row.colors,
  fontFamily: row.font_family || 'Arial, sans-serif',
  imageUrl: row.image_url,
  html: row.html,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function fetchSignatures(userId: string): Promise<Signature[]> {
  const { data, error } = await supabase
    .from('signatures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as SignatureRow[] | null)?.map(mapSignature) ?? [];
}

export async function saveSignature(params: {
  id?: string;
  userId: string;
  name: string;
  label: string;
  templateId: TemplateId;
  formData: FormData;
  colors: BrandColors;
  fontFamily: string;
  imageUrl: string | null;
  html: string;
}): Promise<Signature> {
  const payload = {
    user_id: params.userId,
    name: params.name.trim(),
    label: params.label.trim(),
    template_id: params.templateId,
    form_data: params.formData,
    colors: params.colors,
    font_family: params.fontFamily,
    image_url: params.imageUrl,
    html: params.html,
    updated_at: new Date().toISOString(),
  };

  if (params.id) {
    const { data, error } = await supabase
      .from('signatures')
      .update(payload)
      .eq('id', params.id)
      .eq('user_id', params.userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw error || new Error('No se pudo actualizar la firma.');
    }
    return mapSignature(data as SignatureRow);
  }

  const { data, error } = await supabase.from('signatures').insert(payload).select().maybeSingle();
  if (error || !data) {
    throw error || new Error('No se pudo guardar la firma.');
  }
  return mapSignature(data as SignatureRow);
}

export async function deleteSignature(userId: string, signatureId: string) {
  const { error } = await supabase.from('signatures').delete().eq('id', signatureId).eq('user_id', userId);
  if (error) throw error;
}
