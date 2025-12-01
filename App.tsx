import React, { useState, useEffect } from 'react';
import { SignatureForm } from './components/SignatureForm';
import { LivePreview } from './components/LivePreview';
import { FormData, BrandColors, TemplateId } from './types';
import { setIconUrls } from './services/signatureGenerator';
import { useAuth } from './auth/AuthContext';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { getIconUrlsFromSupabase } from './storage/supabaseStorage';

const initialFormData: FormData = {
  fullName: '', jobTitle: '', company: '', email: '', phone: '', website: '',
  address: '', linkedin: '', twitter: '', instagram: '', facebook: '', tagline: '',
  calendarUrl: '', calendarText: ''
};

const initialColors: BrandColors = {
  primary: '#facc15', // yellow-400
  secondary: '#333333',
  text: '#111111',
  background: '#ffffff'
};

const LOGO_URL = "https://contractorcommander.com/wp-content/uploads/2025/09/icon128.png";

function App() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [colors, setColors] = useState<BrandColors>(initialColors);
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(TemplateId.Modern);

  useEffect(() => {
    try {
        const savedData = localStorage.getItem('signatureFormData');
        const savedColors = localStorage.getItem('signatureBrandColors');
        if (savedData) setFormData(JSON.parse(savedData));
        if (savedColors) setColors(JSON.parse(savedColors));
    } catch(error) {
        console.error("Failed to parse from localStorage", error);
    }
  }, []);

  // Configure icon URLs from Supabase public bucket; set per-icon when available
  useEffect(() => {
    const preferredBucket = (import.meta.env.VITE_SUPABASE_ICONS_BUCKET as string) || 'icons';
    const fallbackBucket = preferredBucket === 'icons' ? 'icon' : 'icons';
    const buckets = Array.from(new Set([preferredBucket, fallbackBucket]));

    const preloadIcon = (iconName: keyof ReturnType<typeof getIconUrlsFromSupabase>, bucketIndex = 0) => {
      const bucket = buckets[bucketIndex];
      const urls = getIconUrlsFromSupabase(bucket);
      const url = urls[iconName];
      const img = new Image();
      img.onload = () => setIconUrls({ [iconName]: url });
      img.onerror = () => {
        const next = bucketIndex + 1;
        if (next < buckets.length) preloadIcon(iconName, next);
      };
      img.src = url;
    };

    const firstBucketUrls = getIconUrlsFromSupabase(buckets[0]);
    (Object.keys(firstBucketUrls) as (keyof typeof firstBucketUrls)[]).forEach((iconName) => preloadIcon(iconName));
  }, []);

  useEffect(() => {
    localStorage.setItem('signatureFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('signatureBrandColors', JSON.stringify(colors));
  }, [colors]);

  const handleReset = () => {
    if(window.confirm('Are you sure you want to clear all fields?')) {
        setFormData(initialFormData);
        setColors(initialColors);
        setImageData(null);
        setSelectedTemplate(TemplateId.Modern);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-[1800px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">MAS Signature Free</h1>
                <p className="text-xs md:text-sm text-gray-500">Design in real-time, copy instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-3 py-1.5 text-xs bg-gray-200 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Side by Side Layout */}
      <main className="container mx-auto px-4 py-6 max-w-[1800px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Design Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-black">Design Your Signature</h2>
              <p className="text-sm text-gray-800 mt-1">Changes update instantly on the right →</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SignatureForm
                formData={formData}
                setFormData={setFormData}
                colors={colors}
                setColors={setColors}
                imageData={imageData}
                setImageData={setImageData}
                onGenerate={() => {}} // No longer needed - preview is live
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <LivePreview
              formData={formData}
              colors={colors}
              imageData={imageData}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Designed by <a href="https://masvirtual.co" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-600 hover:text-amber-600 transition">masvirtual.co</a></p>
      </footer>
    </div>
  );
}

export default App;
