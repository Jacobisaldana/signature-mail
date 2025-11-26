import React, { useMemo } from 'react';
import { validateImageUrl, validateSignatureSize, SignatureSizeInfo, UrlValidationResult } from '../utils/imageOptimizer';

interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  fix?: string;
}

interface SignatureCompatibilityCheckerProps {
  signatureHtml: string;
  imageUrl: string | null;
}

export const SignatureCompatibilityChecker: React.FC<SignatureCompatibilityCheckerProps> = ({
  signatureHtml,
  imageUrl,
}) => {
  const issues = useMemo(() => {
    const found: CompatibilityIssue[] = [];

    // 1. Check image URL
    if (imageUrl) {
      const urlValidation = validateImageUrl(imageUrl);
      if (!urlValidation.valid) {
        found.push({
          type: 'error',
          title: 'Image URL Issue',
          message: urlValidation.errors[0] || 'Invalid image URL',
          fix: 'Upload your avatar to get a public URL',
        });
      }
      if (urlValidation.warnings.length > 0) {
        found.push({
          type: 'warning',
          title: 'Image URL Warning',
          message: urlValidation.warnings[0],
        });
      }
    }

    // 2. Check signature size
    const sizeInfo = validateSignatureSize(signatureHtml);
    if (!sizeInfo.withinLimits) {
      found.push({
        type: 'error',
        title: 'Signature Too Large',
        message: `Your signature is ${sizeInfo.estimatedKb}KB, exceeding Gmail's 10KB limit`,
        fix: 'Reduce image size, remove unnecessary content, or simplify styling',
      });
    } else if (sizeInfo.warnings.length > 0) {
      found.push({
        type: 'warning',
        title: 'Size Warning',
        message: sizeInfo.warnings[0],
      });
    }

    // 3. Check for data URLs in HTML (critical error)
    if (signatureHtml.includes('data:image')) {
      found.push({
        type: 'error',
        title: 'Data URL Detected',
        message: 'Your signature contains embedded images (data URLs) which may be blocked by Gmail',
        fix: 'Upload your images to get public URLs',
      });
    }

    // 4. Check for common HTML issues
    if (signatureHtml.includes('<div')) {
      found.push({
        type: 'warning',
        title: 'DIV Elements Detected',
        message: 'Outlook may not render <div> elements correctly',
        fix: 'Templates should use table-based layouts for maximum compatibility',
      });
    }

    // 5. Check for CSS issues
    if (signatureHtml.includes('style=') && signatureHtml.includes('class=')) {
      found.push({
        type: 'warning',
        title: 'CSS Classes Detected',
        message: 'CSS classes may not work in email signatures',
        fix: 'Use inline styles only',
      });
    }

    // 6. Check for responsive/modern CSS
    if (signatureHtml.match(/(flexbox|grid|@media|vh|vw)/i)) {
      found.push({
        type: 'error',
        title: 'Modern CSS Detected',
        message: 'Modern CSS (flexbox, grid, media queries) is not supported in email',
        fix: 'Use table-based layouts with fixed widths',
      });
    }

    // 7. Positive feedback if all good
    if (found.length === 0) {
      found.push({
        type: 'info',
        title: 'All Good!',
        message: `Your signature is ${sizeInfo.estimatedKb}KB and should work in all major email clients`,
      });
    }

    return found;
  }, [signatureHtml, imageUrl]);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');
  const infos = issues.filter((i) => i.type === 'info');

  if (issues.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        Compatibility Check
      </div>

      {/* Errors */}
      {errors.map((issue, idx) => (
        <div
          key={`error-${idx}`}
          className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r"
          role="alert"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">{issue.title}</p>
              <p className="text-xs text-red-700 mt-1">{issue.message}</p>
              {issue.fix && (
                <p className="text-xs text-red-600 mt-1">
                  <strong>Fix:</strong> {issue.fix}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {warnings.map((issue, idx) => (
        <div
          key={`warning-${idx}`}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">{issue.title}</p>
              <p className="text-xs text-yellow-700 mt-1">{issue.message}</p>
              {issue.fix && (
                <p className="text-xs text-yellow-600 mt-1">
                  <strong>Tip:</strong> {issue.fix}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Info */}
      {infos.map((issue, idx) => (
        <div
          key={`info-${idx}`}
          className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"
        >
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">{issue.title}</p>
              <p className="text-xs text-green-700 mt-1">{issue.message}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Email client compatibility matrix */}
      {errors.length === 0 && (
        <details className="mt-3">
          <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800 transition">
            Email Client Compatibility
          </summary>
          <div className="mt-2 bg-gray-50 rounded p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Gmail (Web/Mobile)</span>
              <span className="text-green-600 font-semibold">✓ Compatible</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Outlook Desktop</span>
              <span className="text-green-600 font-semibold">✓ Compatible</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Outlook Web</span>
              <span className="text-green-600 font-semibold">✓ Compatible</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Apple Mail</span>
              <span className="text-green-600 font-semibold">✓ Compatible</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Mobile Clients</span>
              <span className="text-green-600 font-semibold">✓ Compatible</span>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
