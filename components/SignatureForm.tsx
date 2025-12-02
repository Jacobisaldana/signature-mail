import React, { useEffect, useRef, useState } from 'react';
import { FormData, BrandColors } from '../types';
import { listUserAvatars, uploadAvatar } from '../storage/supabaseStorage';
import { useAuth } from '../auth/AuthContext';
import ImageCropper from './ImageCropper';
import { validateImageForEmail, optimizeImageForEmail } from '../utils/imageOptimizer';

interface SignatureFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  setImageData: React.Dispatch<React.SetStateAction<string | null>>;
  imageData: string | null;
  onGenerate: () => void;
  onReset: () => void;
}

const InputField: React.FC<{ id: keyof FormData; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; isRequired?: boolean; }> = ({ id, label, value, onChange, placeholder, type = 'text', isRequired = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label} {isRequired && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
        />
    </div>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input type="color" value={value} onChange={onChange} className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer p-0 appearance-none" style={{backgroundColor: value}}/>
        </div>
    </div>
);

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
];

export const SignatureForm: React.FC<SignatureFormProps> = ({ formData, setFormData, fontFamily, setFontFamily, setImageData, imageData, onGenerate, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const uploadVersionRef = useRef(0);
  const [savedAvatars, setSavedAvatars] = useState<string[]>([]);
  const [savedAvatarsLoading, setSavedAvatarsLoading] = useState(false);
  const [savedAvatarsError, setSavedAvatarsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        setSavedAvatars([]);
        return;
      }
      setSavedAvatarsLoading(true);
      setSavedAvatarsError(null);
      try {
        const items = await listUserAvatars(user.id);
        if (!active) return;
        setSavedAvatars(items.map((i) => i.url));
      } catch (err: any) {
        if (!active) return;
        console.error('Could not list avatars', err);
        setSavedAvatarsError(err?.message || 'Could not load your uploaded images.');
      } finally {
        if (active) setSavedAvatarsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image
      const validation = await validateImageForEmail(file);

      if (!validation.valid) {
        alert(`Invalid image:\n${validation.errors.join('\n')}`);
        if (e.target) e.target.value = '';
        return;
      }

      // Open cropper first; upload after user confirms
      uploadVersionRef.current += 1; // invalidate any pending uploads
      setCropFile(file);
      setIsCropping(true);
    }
    // Clear input so the same file can be selected again
    if (e.target) e.target.value = '';
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setCropFile(null);
  };

  const blobToDataUrl = (b: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(b);
  });

  const handleCropConfirm = async (blob: Blob) => {
    try {
      const version = ++uploadVersionRef.current;

      // CRITICAL: Always upload to get a public URL, never use data URLs in signatures
      if (!user) {
        alert('Please sign in to upload your avatar. Email signatures require publicly hosted images.');
        setIsCropping(false);
        setCropFile(null);
        return;
      }

      // Optimize image for email (resize, compress)
      const optimizedBlob = await optimizeImageForEmail(blob, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.85,
        outputFormat: 'image/jpeg',
      });

      // Show temporary placeholder while uploading
      setImageData('uploading');

      // Upload optimized image to Supabase
      const file = new File([optimizedBlob], `avatar.jpg`, { type: 'image/jpeg' });
      const { url } = await uploadAvatar(file, user.id);

      // Add cache-busting parameter to force reload
      const versioned = `${url}?v=${Date.now()}`;

      // Only update if this is still the latest upload
      if (version === uploadVersionRef.current) {
        setImageData(versioned);
      }
    } catch (err) {
      console.error('Crop/Upload failed', err);
      alert('Could not process and upload the image. Please try again or use a different image.');
      setImageData(null);
    } finally {
      setIsCropping(false);
      setCropFile(null);
    }
  };

  return (
    <>
    <div className="space-y-8 p-4 md:p-6">
        {/* Image Upload */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Image or Logo</h3>
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {imageData ? <img src={imageData} alt="Preview" className="w-full h-full" style={{ objectFit: 'cover' as const }} /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                </div>
                <div className="flex-grow">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-amber-50 text-amber-700 font-semibold rounded-md hover:bg-amber-100 transition">
                        Upload Image
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/gif" className="hidden" />
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF (Max 2MB). Recommended: 200×200px. You can crop and adjust before uploading.</p>
                </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Previously uploaded</p>
                <button
                  type="button"
                  onClick={() => {
                    // force reload list
                    if (!user) return;
                    setSavedAvatarsError(null);
                    setSavedAvatarsLoading(true);
                    listUserAvatars(user.id)
                      .then((items) => setSavedAvatars(items.map((i) => i.url)))
                      .catch((err: any) => setSavedAvatarsError(err?.message || 'Could not refresh images.'))
                      .finally(() => setSavedAvatarsLoading(false));
                  }}
                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  disabled={savedAvatarsLoading}
                >
                  {savedAvatarsLoading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
              {savedAvatarsError && <p className="text-xs text-red-600 mb-2">{savedAvatarsError}</p>}
              {savedAvatarsLoading && savedAvatars.length === 0 ? (
                <p className="text-xs text-gray-500">Loading your images…</p>
              ) : savedAvatars.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {savedAvatars.map((url) => {
                    const isActive = imageData === url;
                    return (
                      <button
                        type="button"
                        key={url}
                        onClick={() => setImageData(url)}
                        className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isActive ? 'border-amber-500' : 'border-transparent'} shadow-sm hover:shadow-md transition`}
                        title="Use this image"
                      >
                        <img src={url} alt="Saved avatar" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">You will see your uploaded images here to reuse them in other signatures.</p>
              )}
            </div>
        </div>
        
        {/* Personal Info */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="fullName" label="Full Name" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" isRequired />
                <InputField id="jobTitle" label="Job Title" value={formData.jobTitle} onChange={handleInputChange} placeholder="Marketing Director" isRequired />
                <InputField id="company" label="Company" value={formData.company} onChange={handleInputChange} placeholder="Tech Solutions Inc." isRequired />
                <InputField id="email" label="Email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@company.com" isRequired />
                <InputField id="phone" label="Phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+1 555 123 4567" />
                <InputField id="website" label="Website" value={formData.website} onChange={handleInputChange} type="url" placeholder="https://company.com" />
                <InputField id="address" label="Address" value={formData.address} onChange={handleInputChange} placeholder="City, Country" />
                <InputField id="tagline" label="Tagline or Motto" value={formData.tagline} onChange={handleInputChange} placeholder="Innovation that inspires" />
            </div>
        </div>

        {/* Calendar Link */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendar Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="calendarUrl" label="Calendar URL (Cal.com, Calendly)" value={formData.calendarUrl} onChange={handleInputChange} type="url" placeholder="https://cal.com/your-name" />
                <InputField id="calendarText" label="Button Text" value={formData.calendarText} onChange={handleInputChange} placeholder="Schedule a meeting" />
            </div>
        </div>

        {/* Social Media */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="linkedin" label="LinkedIn URL" value={formData.linkedin} onChange={handleInputChange} type="url" placeholder="https://linkedin.com/in/..." />
                <InputField id="twitter" label="Twitter / X URL" value={formData.twitter} onChange={handleInputChange} type="url" placeholder="https://twitter.com/..." />
                <InputField id="instagram" label="Instagram URL" value={formData.instagram} onChange={handleInputChange} type="url" placeholder="https://instagram.com/..." />
                <InputField id="facebook" label="Facebook URL" value={formData.facebook} onChange={handleInputChange} type="url" placeholder="https://facebook.com/..." />
            </div>
        </div>

        {/* Font */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Typography</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily }}>
              Preview text in selected font: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center space-y-3 sticky bottom-0 py-4 bg-gradient-to-t from-white via-white to-transparent">
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                    Preview updates in real-time on the right →
                </p>
            </div>
            <button
                onClick={onReset}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition shadow-sm"
            >
                Reset Form
            </button>
        </div>
    </div>
    <SignatureFormCropPortal open={isCropping} file={cropFile} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />
    </>
  );
};

// Modal de recorte
export const SignatureFormCropPortal: React.FC<{ open: boolean; file: File | null; onCancel: () => void; onConfirm: (blob: Blob) => void; }> = ({ open, file, onCancel, onConfirm }) => {
  if (!open || !file) return null;
  return (
    <ImageCropper key={`${file.name}-${file.size}-${file.lastModified}`} file={file} onCancel={onCancel} onConfirm={onConfirm} />
  );
};
