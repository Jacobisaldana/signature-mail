import React, { useRef, useEffect, useState } from 'react';
import { FormData, BrandColors, TemplateId } from '../types';
import { generateSignatureHtml } from '../services/signatureGenerator';
import { TEMPLATES } from '../templates';
import { SignatureCompatibilityChecker } from './SignatureCompatibilityChecker';

interface LivePreviewProps {
  formData: FormData;
  colors: BrandColors;
  fontFamily: string;
  imageData: string | null;
  selectedTemplate: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  onSaveSignature: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  formData,
  colors,
  fontFamily,
  imageData,
  selectedTemplate,
  onTemplateChange,
  onSaveSignature,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const currentTemplateId = selectedTemplate || TemplateId.Modern;
  const currentTemplate = TEMPLATES.find(t => t.id === currentTemplateId);

  const signatureHtml = generateSignatureHtml(currentTemplateId, {
    data: formData,
    colors,
    fontFamily,
    imageData,
  });

  useEffect(() => {
    const timer = window.setTimeout(adjustIframeHeight, 30);
    return () => window.clearTimeout(timer);
  }, [signatureHtml, currentTemplateId]);

  const adjustIframeHeight = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const contentHeight = iframe.contentWindow.document.body.scrollHeight;
      iframe.style.height = `${contentHeight + 10}px`;
    }
  };

  const scrollTemplates = (direction: 'left' | 'right') => {
    const container = templatesRef.current;
    if (!container) return;
    const delta = direction === 'left' ? -200 : 200;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Copies rich HTML to clipboard
  const handleCopyRich = async () => {
    const html = signatureHtml.trim();
    try {
      // Try copying from the live iframe (preserves table layout for Gmail)
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const doc = iframe.contentWindow.document;
        const range = doc.createRange();
        range.selectNodeContents(doc.body);
        const sel = doc.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        const ok = doc.execCommand('copy');
        sel?.removeAllRanges();
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }

      // Modern API fallback
      const supportsClipboardItem = 'ClipboardItem' in window && navigator.clipboard && 'write' in navigator.clipboard;
      if (supportsClipboardItem) {
        const item = new (window as any).ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html.replace(/\n+/g, ' ')], { type: 'text/plain' }),
        });
        await (navigator.clipboard as any).write([item]);
      } else {
        // Old-school execCommand fallback
        const container = document.createElement('div');
        container.setAttribute('contenteditable', 'true');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.innerHTML = html;
        document.body.appendChild(container);

        const range = document.createRange();
        range.selectNodeContents(container);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        document.body.removeChild(container);
        sel?.removeAllRanges();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Rich copy failed', err);
      alert('Could not copy signature. Please try again.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Could not copy the code.');
    }
  };

  // Show placeholder if no required fields filled
  const hasContent =
    !!(
      formData.fullName ||
      formData.email ||
      formData.company ||
      formData.jobTitle ||
      formData.tagline ||
      imageData
    );
  const canCopy = !!(formData.fullName && formData.email);
  const canSave = canCopy && imageData !== 'uploading';

  return (
    <div className="flex flex-col h-full">
      {/* Header with template switcher */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={onSaveSignature}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              title="Save this signature for later"
              disabled={!canSave}
            >
              Save Signature
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              title="Copy HTML code"
            >
              Copy Code
            </button>
            <button
              onClick={handleCopyRich}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-black'
              }`}
              title="Copy signature as rich HTML"
              disabled={!canCopy}
            >
              {copied ? '✓ Copied!' : 'Copy Signature'}
            </button>
          </div>
        </div>

        {/* Template thumbnails slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTemplates('left')}
            className="hidden md:inline-flex px-2 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            title="Previous templates"
          >
            ‹
          </button>
          <div
            ref={templatesRef}
            className="flex gap-2 overflow-x-auto pb-1 scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {TEMPLATES.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => onTemplateChange(template.id)}
                  className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg border transition text-xs min-w-[110px] ${
                    isSelected ? 'border-amber-500 bg-amber-50 text-gray-900' : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                  }`}
                  title={template.name}
                >
                  <div className="w-full h-14 mb-1 rounded-md overflow-hidden">
                    <template.component colors={colors} />
                  </div>
                  <span className="font-medium truncate w-full text-center">{template.name}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollTemplates('right')}
            className="hidden md:inline-flex px-2 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            title="Next templates"
          >
            ›
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {hasContent ? (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {currentTemplate?.name}
              </span>
              <span className="text-xs text-gray-400">Updates in real-time</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <iframe
                ref={iframeRef}
                srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;}</style></head><body>${signatureHtml}</body></html>`}
                title={`${currentTemplate?.name} Preview`}
                onLoad={adjustIframeHeight}
                scrolling="no"
                frameBorder="0"
                className="w-full"
                style={{ minWidth: '400px' }}
              />
            </div>

            {/* Compatibility checker */}
            <SignatureCompatibilityChecker signatureHtml={signatureHtml} imageUrl={imageData} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Start Designing
              </h3>
              <p className="text-sm text-gray-500">
                Fill in the required fields (*) on the left to see your signature preview here in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
