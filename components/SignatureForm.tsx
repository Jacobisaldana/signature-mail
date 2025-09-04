import React, { useRef } from 'react';
import { FormData, BrandColors, TemplateId } from '../types';
import { TemplateSelector } from './TemplateSelector';

interface SignatureFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  colors: BrandColors;
  setColors: React.Dispatch<React.SetStateAction<BrandColors>>;
  setImageData: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTemplates: TemplateId[];
  setSelectedTemplates: React.Dispatch<React.SetStateAction<TemplateId[]>>;
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

export const SignatureForm: React.FC<SignatureFormProps> = ({ formData, setFormData, colors, setColors, setImageData, selectedTemplates, setSelectedTemplates, imageData, onGenerate, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setColors(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size cannot exceed 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateToggle = (id: TemplateId) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
        {/* Image Upload */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Image or Logo</h3>
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {imageData ? <img src={imageData} alt="Preview" className="w-full h-full object-cover" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                </div>
                <div className="flex-grow">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-amber-50 text-amber-700 font-semibold rounded-md hover:bg-amber-100 transition">
                        Upload Image
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/gif" className="hidden" />
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF (Max 2MB). Recommended: 200x200px.</p>
                </div>
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

        {/* Branding */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Brand Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorPicker label="Primary" value={colors.primary} onChange={(e) => setColors(p => ({...p, primary: e.target.value}))} />
                <ColorPicker label="Secondary" value={colors.secondary} onChange={(e) => setColors(p => ({...p, secondary: e.target.value}))} />
                <ColorPicker label="Text" value={colors.text} onChange={(e) => setColors(p => ({...p, text: e.target.value}))} />
                <ColorPicker label="Background" value={colors.background} onChange={(e) => setColors(p => ({...p, background: e.target.value}))} />
            </div>
        </div>

        {/* Template Selection */}
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <TemplateSelector selectedTemplates={selectedTemplates} onTemplateToggle={handleTemplateToggle} colors={colors} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4 sticky bottom-0 py-4 bg-gray-100/80 backdrop-blur-sm">
            <button
                onClick={onGenerate}
                className="px-8 py-3 bg-amber-500 text-black font-bold rounded-lg shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105"
            >
                Generate Signatures
            </button>
            <button
                onClick={onReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
                Reset Form
            </button>
        </div>
    </div>
  );
};