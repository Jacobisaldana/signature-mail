import React, { useState, useEffect, useCallback } from 'react';
import { SignatureForm } from './components/SignatureForm';
import { LivePreview } from './components/LivePreview';
import { FormData, BrandColors, TemplateId, Signature } from './types';
import { setIconUrls, generateSignatureHtml } from './services/signatureGenerator';
import { useAuth } from './auth/AuthContext';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { getIconUrlsFromSupabase } from './storage/supabaseStorage';
import { SaveSignatureModal } from './components/SaveSignatureModal';
import { fetchSignatures, saveSignature } from './services/signatureStorage';
import { ProfilePage } from './components/ProfilePage';

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

const DEFAULT_FONT = 'Arial, sans-serif';

const LOGO_URL = "https://contractorcommander.com/wp-content/uploads/2025/09/icon128.png";

function App() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [colors, setColors] = useState<BrandColors>(initialColors);
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(TemplateId.Modern);
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT);
  const [activeView, setActiveView] = useState<'builder' | 'profile'>('builder');
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signaturesLoading, setSignaturesLoading] = useState(false);
  const [signaturesError, setSignaturesError] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveDefaults, setSaveDefaults] = useState({ name: '', label: 'Personal' });
  const [editingSignatureId, setEditingSignatureId] = useState<string | null>(null);

  const loadSignatures = useCallback(async () => {
    if (!user) return;
    setSignaturesLoading(true);
    setSignaturesError(null);
    try {
      const rows = await fetchSignatures(user.id);
      setSignatures(rows);
    } catch (err: any) {
      console.error('Could not load signatures', err);
      setSignaturesError(err?.message || 'No se pudieron cargar tus firmas.');
    } finally {
      setSignaturesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    try {
        const savedData = localStorage.getItem('signatureFormData');
        const savedColors = localStorage.getItem('signatureBrandColors');
        const savedFont = localStorage.getItem('signatureFontFamily');
        if (savedData) setFormData(JSON.parse(savedData));
        if (savedColors) setColors(JSON.parse(savedColors));
        if (savedFont) setFontFamily(savedFont);
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

  useEffect(() => {
    localStorage.setItem('signatureFontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    if (user) {
      loadSignatures();
    } else {
      setSignatures([]);
    }
  }, [user, loadSignatures]);

  const handleReset = () => {
    if(window.confirm('Are you sure you want to clear all fields?')) {
        setFormData(initialFormData);
        setColors(initialColors);
        setImageData(null);
        setSelectedTemplate(TemplateId.Modern);
        setFontFamily(DEFAULT_FONT);
        setEditingSignatureId(null);
        setSaveDefaults({ name: '', label: 'Personal' });
    }
  };

  const openSaveModal = () => {
    if (!formData.fullName || !formData.email) {
      alert('Agrega al menos nombre completo y correo para guardar tu firma.');
      return;
    }
    if (imageData === 'uploading') {
      alert('Espera a que la imagen termine de subir antes de guardar.');
      return;
    }
    setSaveDefaults((prev) => {
      const suggestedName = formData.fullName ? `${formData.fullName}${formData.company ? ` - ${formData.company}` : ''}` : prev.name || 'Nueva firma';
      return { name: suggestedName, label: prev.label || 'Personal' };
    });
    setSaveError(null);
    setSaveModalOpen(true);
  };

  const handleSaveSignature = async (name: string, label: string) => {
    if (!user) {
      setSaveError('Debes iniciar sesión para guardar firmas.');
      return;
    }
    if (!formData.fullName || !formData.email) {
      setSaveError('Completa el nombre completo y el correo electrónico.');
      return;
    }
    if (imageData === 'uploading') {
      setSaveError('Espera a que termine la carga de la imagen.');
      return;
    }

    setSavingSignature(true);
    setSaveError(null);
    try {
      const imageUrl = imageData && imageData !== 'uploading' ? imageData : null;
      const html = generateSignatureHtml(selectedTemplate, {
        data: formData,
        colors,
        imageData: imageUrl,
        fontFamily,
      }).trim();
      const saved = await saveSignature({
        id: editingSignatureId || undefined,
        userId: user.id,
        name: name.trim() || formData.fullName || 'Firma sin título',
        label: label.trim() || 'Personal',
        templateId: selectedTemplate,
        formData,
        colors,
        fontFamily,
        imageUrl,
        html,
      });
      setSaveDefaults({ name: saved.name, label: saved.label });
      setEditingSignatureId(saved.id);
      setSignatures((prev) => {
        const others = prev.filter((s) => s.id !== saved.id);
        return [saved, ...others];
      });
      setSaveModalOpen(false);
      loadSignatures();
    } catch (err: any) {
      console.error('Save signature failed', err);
      setSaveError(err?.message || 'No se pudo guardar la firma.');
    } finally {
      setSavingSignature(false);
    }
  };

  const handleEditSignature = (signature: Signature) => {
    setFormData(signature.formData);
    setColors(signature.colors);
    setImageData(signature.imageUrl);
    setSelectedTemplate(signature.templateId);
    setFontFamily(signature.fontFamily || DEFAULT_FONT);
    setEditingSignatureId(signature.id);
    setSaveDefaults({ name: signature.name, label: signature.label });
    setActiveView('builder');
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('builder')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    activeView === 'builder' ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => { setActiveView('profile'); loadSignatures(); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                    activeView === 'profile' ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Perfil
                </button>
              </div>
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
      <main className="py-6">
        {activeView === 'builder' ? (
          <div className="container mx-auto px-4 max-w-[1800px]">
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
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
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
                  fontFamily={fontFamily}
                  imageData={imageData}
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                  onSaveSignature={openSaveModal}
                  onColorsChange={setColors}
                />
              </div>
            </div>
          </div>
        ) : (
          <ProfilePage
            user={user}
            signatures={signatures}
            loading={signaturesLoading}
            error={signaturesError}
            onRefresh={loadSignatures}
            onEditSignature={handleEditSignature}
          />
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Designed by <a href="https://masvirtual.co" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-600 hover:text-amber-600 transition">masvirtual.co</a></p>
      </footer>

      <SaveSignatureModal
        open={saveModalOpen}
        initialName={saveDefaults.name}
        initialLabel={saveDefaults.label}
        onCancel={() => setSaveModalOpen(false)}
        onConfirm={handleSaveSignature}
        saving={savingSignature}
        error={saveError}
      />
    </div>
  );
}

export default App;
