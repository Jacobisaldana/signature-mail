import React, { useRef, useEffect, useState } from 'react';
import { FormData, BrandColors, TemplateId } from '../types';
import { generateSignatureHtml } from '../services/signatureGenerator';
import { TEMPLATES } from './TemplateSelector';
import { SignatureCompatibilityChecker } from './SignatureCompatibilityChecker';

interface LivePreviewProps {
  formData: FormData;
  colors: BrandColors;
  imageData: string | null;
  selectedTemplates: TemplateId[];
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  formData,
  colors,
  imageData,
  selectedTemplates,
}) => {
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-adjust to first selected template if current index is out of bounds
  useEffect(() => {
    if (activeTemplateIndex >= selectedTemplates.length) {
      setActiveTemplateIndex(Math.max(0, selectedTemplates.length - 1));
    }
  }, [selectedTemplates.length, activeTemplateIndex]);

  const currentTemplateId = selectedTemplates[activeTemplateIndex] || TemplateId.Modern;
  const currentTemplate = TEMPLATES.find(t => t.id === currentTemplateId);

  const signatureHtml = generateSignatureHtml(currentTemplateId, {
    data: formData,
    colors,
    imageData,
  });

  const adjustIframeHeight = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const contentHeight = iframe.contentWindow.document.body.scrollHeight;
      iframe.style.height = `${contentHeight + 10}px`;
    }
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
  const hasRequiredFields = formData.fullName && formData.jobTitle && formData.company && formData.email;

  return (
    <div className="flex flex-col h-full">
      {/* Header with template switcher */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          <div className="flex gap-2">
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
              disabled={!hasRequiredFields}
            >
              {copied ? '✓ Copied!' : 'Copy Signature'}
            </button>
          </div>
        </div>

        {/* Template tabs if multiple selected */}
        {selectedTemplates.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {selectedTemplates.map((templateId, index) => {
              const template = TEMPLATES.find(t => t.id === templateId);
              return (
                <button
                  key={templateId}
                  onClick={() => setActiveTemplateIndex(index)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition ${
                    index === activeTemplateIndex
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template?.name || 'Template'}
                </button>
              );
            })}
          </div>
        )}

        {selectedTemplates.length === 0 && (
          <p className="text-sm text-amber-600">⚠️ Please select at least one template below</p>
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {hasRequiredFields && selectedTemplates.length > 0 ? (
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
