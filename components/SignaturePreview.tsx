
import React, { useState, useRef } from 'react';
import { Signature } from '../types';

interface SignaturePreviewProps {
  signature: Signature;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({ signature }) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(signature.html.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Could not copy the code.');
    }
  };

  // Copies rich HTML to clipboard so pasting into Gmail/Outlook preserves formatting
  const handleCopyRich = async () => {
    const html = signature.html.trim();
    try {
      // Try copying from the live iframe (often preserves table layout best for Gmail)
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

      // Preferred modern API
      const supportsClipboardItem = 'ClipboardItem' in window && navigator.clipboard && 'write' in navigator.clipboard;
      if (supportsClipboardItem) {
        const item = new (window as any).ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html.replace(/\n+/g, ' ')], { type: 'text/plain' }),
        });
        await (navigator.clipboard as any).write([item]);
      } else {
        // Fallback: use a hidden, selectable container and execCommand
        const container = document.createElement('div');
        container.setAttribute('contenteditable', 'true');
        // Ensure offscreen and not affecting layout
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
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
      console.warn('Rich copy failed, falling back to code copy', err);
      await handleCopyCode();
    }
  };

  const adjustIframeHeight = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const contentHeight = iframe.contentWindow.document.body.scrollHeight;
      // Add a small buffer to prevent scrollbars from appearing in some cases
      iframe.style.height = `${contentHeight + 5}px`;
    }
  };
  
  // Basic HTML formatter for display
  const formatHtml = (html: string) => {
    const tab = '  ';
    let result = '';
    let indent = '';

    html.split(/>\s*</).forEach(element => {
        if (element.match( /^\/\w/ )) {
            indent = indent.substring(tab.length);
        }
        result += indent + '<' + element + '>\r\n';
        if (element.match( /^<?\w[^>]*[^\/]$/ ) && !element.startsWith("img")) { 
            indent += tab;
        }
    });

    return result.substring(1, result.length-2);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-md font-semibold text-gray-800">{signature.name}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
          <button
            onClick={handleCopyRich}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${copied ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
            title="Copy as rich content (HTML)"
          >
            {copied ? 'Copied!' : 'Copy Signature'}
          </button>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            title="Copy HTML code"
          >
            Copy Code
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-gray-100 min-h-[150px] overflow-x-auto">
         <iframe
            ref={iframeRef}
            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;}</style></head><body>${signature.html}</body></html>`}
            title={`${signature.name} Preview`}
            onLoad={adjustIframeHeight}
            scrolling="no"
            frameBorder="0"
            className="w-full"
            style={{ minWidth: '500px' }} // Prevent narrow signatures from breaking layout
         />
      </div>

      {showCode && (
        <div className="bg-gray-800 p-4">
          <pre className="text-white text-xs overflow-x-auto whitespace-pre-wrap break-all">
            <code>{formatHtml(signature.html.trim())}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
