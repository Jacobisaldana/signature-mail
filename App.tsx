import React, { useState, useEffect, useCallback } from 'react';
import { SignatureForm } from './components/SignatureForm';
import { SignaturePreview } from './components/SignaturePreview';
import { FormData, BrandColors, TemplateId, Signature } from './types';
import { generateSignatureHtml, setIconUrls } from './services/signatureGenerator';
import { TEMPLATES } from './components/TemplateSelector';
import { InstallationGuide } from './components/InstallationGuide';
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

enum Tab {
  Form = 'form',
  Preview = 'preview',
}

const LOGO_URL = "https://contractorcommander.com/wp-content/uploads/2025/09/icon128.png";

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Form);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [colors, setColors] = useState<BrandColors>(initialColors);
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateId[]>([TemplateId.Modern, TemplateId.Minimalist]);
  const [generatedSignatures, setGeneratedSignatures] = useState<Signature[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

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
    const urls = getIconUrlsFromSupabase();
    (Object.keys(urls) as (keyof typeof urls)[]).forEach((k) => {
      const img = new Image();
      img.onload = () => setIconUrls({ [k]: urls[k] });
      img.onerror = () => {/* keep fallback for this icon */};
      img.src = urls[k];
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('signatureFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('signatureBrandColors', JSON.stringify(colors));
  }, [colors]);

  const handleGenerate = useCallback(async () => {
    if (!formData.fullName || !formData.jobTitle || !formData.company || !formData.email) {
      alert('Please complete the required fields (*).');
      return;
    }
    if(selectedTemplates.length === 0) {
      alert('Please select at least one signature template.');
      return;
    }

    // If the image is still a data URL, try to upload now to get a short public URL
    if (imageData && imageData.startsWith('data:')) {
      try {
        // First try simple server-side upload
        const up = await fetch('/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: imageData, filename: 'avatar' }),
        });
        if (up.ok) {
          const { url } = await up.json();
          setImageData(url);
        } else {
          // Fallback to presigned upload
          const m = /^data:([^;]+);base64,(.*)$/i.exec(imageData);
          if (!m) throw new Error('Invalid data URL');
          const contentType = m[1];
          const base64 = m[2];
          const binary = atob(base64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: contentType });

          const signed = await fetch('/sign-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType }),
          });
          if (!signed.ok) throw new Error('sign-upload failed');
          const { uploadUrl, publicUrl } = await signed.json();
          const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
          if (!putRes.ok) throw new Error('PUT upload failed');
          setImageData(publicUrl);
        }
      } catch (err) {
        console.warn('Upload at generate time failed:', err);
        alert('No se pudo subir la imagen al bucket. Ejecuta `npm run dev:cf` o despliega para habilitar Functions, y configura CORS en MinIO.');
        return;
      }
    }

    const signatures: Signature[] = selectedTemplates.map(templateId => {
      const template = TEMPLATES.find(t => t.id === templateId);
      return {
        id: templateId,
        name: template ? template.name : 'Signature',
        html: generateSignatureHtml(templateId, { data: formData, colors, imageData }),
      };
    });

    setGeneratedSignatures(signatures);
    setActiveTab(Tab.Preview);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [formData, colors, imageData, selectedTemplates]);

  const handleReset = () => {
    if(window.confirm('Are you sure you want to clear all fields?')) {
        setFormData(initialFormData);
        setColors(initialColors);
        setImageData(null);
        setSelectedTemplates([TemplateId.Modern, TemplateId.Minimalist]);
        setGeneratedSignatures([]);
    }
  };
  
  const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 py-4 px-2 text-center font-semibold border-b-4 transition-colors duration-300 ${activeTab === tabId ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
      {children}
    </button>
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8 flex flex-col items-center">
            <img src={LOGO_URL} alt="Logo" className="h-20 w-20 mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">MAS Signature Free</h1>
          <div className="mt-2">
            <span className="text-sm text-gray-600 mr-3">{user?.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Sign out</button>
          </div>
          <p className="mt-2 text-lg text-gray-600">Craft professional, custom email signatures in seconds.</p>
        </header>

        <main className="bg-gray-100 rounded-2xl shadow-2xl shadow-gray-300/30 overflow-hidden ring-1 ring-gray-200">
          <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
            <TabButton tabId={Tab.Form}>1. Setup</TabButton>
            <TabButton tabId={Tab.Preview}>2. Preview</TabButton>
          </div>
          
          {showSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4 rounded-md" role="alert">
                <p className="font-bold">Success!</p>
                <p>Your signatures have been generated. You can now see them in the Preview tab.</p>
            </div>
          )}

          <div className={activeTab === Tab.Form ? 'block' : 'hidden'}>
            <SignatureForm
              formData={formData}
              setFormData={setFormData}
              colors={colors}
              setColors={setColors}
              imageData={imageData}
              setImageData={setImageData}
              selectedTemplates={selectedTemplates}
              setSelectedTemplates={setSelectedTemplates}
              onGenerate={handleGenerate}
              onReset={handleReset}
            />
          </div>

          <div className={`p-4 md:p-8 ${activeTab === Tab.Preview ? 'block' : 'hidden'}`}>
            {generatedSignatures.length > 0 ? (
              <>
                <div className="flex flex-col gap-8">
                  {generatedSignatures.map(sig => <SignaturePreview key={sig.id} signature={sig} />)}
                </div>
                <InstallationGuide />
              </>
            ) : (
              <div className="text-center py-20 px-6 bg-white rounded-lg border border-dashed">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No signatures generated yet</h3>
                <p className="mt-1 text-sm text-gray-500">Complete the form in the 'Setup' tab and click 'Generate Signatures'.</p>
              </div>
            )}
          </div>
        </main>
        <footer className="text-center py-8 text-gray-500 text-sm">
            <p>Designed by <a href="https://masvirtual.co" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-600 hover:text-amber-600 transition">masvirtual.co</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
