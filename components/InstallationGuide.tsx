import React, { useState } from 'react';

type EmailClient = 'gmail' | 'outlook' | 'apple';

const GuideTab: React.FC<{
  client: EmailClient;
  activeClient: EmailClient;
  onClick: (client: EmailClient) => void;
  children: React.ReactNode;
}> = ({ client, activeClient, onClick, children }) => (
  <button
    onClick={() => onClick(client)}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
      activeClient === client
        ? 'bg-white text-amber-600'
        : 'bg-transparent text-gray-600 hover:bg-white/60'
    }`}
  >
    {children}
  </button>
);

const instructions = {
  gmail: {
    steps: [
      'Click "Copy Signature" button above (the yellow button, NOT "Copy Code")',
      'In Gmail, click the gear icon ⚙️ → "See all settings"',
      'Under "General" tab, scroll to "Signature" section',
      'Click "+ Create new", give it a name (e.g., "Work Signature")',
      'Click in the signature editor and press Ctrl+V (Cmd+V on Mac) to paste',
      'Scroll down and click "Save Changes" at the bottom',
      'Send yourself a test email to verify it looks correct',
    ],
    tips: [
      '✓ Use "Copy Signature" (not "Copy Code") for best results',
      '✓ Gmail may block images from unknown sources - your avatar should be fine since it\'s on a trusted domain',
      '⚠️ If images don\'t show, check your Gmail settings: Settings → General → Images → "Always display external images"',
      '⚠️ Signature size limit is ~10KB - our signatures are optimized to stay under this',
    ],
  },
  outlook: {
    steps: [
      'Click "Copy Signature" button above',
      'Outlook Desktop: File → Options → Mail → Signatures',
      'Outlook Web: Settings ⚙️ → View all Outlook settings → Compose and reply',
      'Click "New signature" (+), give it a name',
      'Click in the editor and press Ctrl+V (Cmd+V on Mac) to paste',
      'For Outlook Desktop: If formatting looks off, open the HTML in a browser first, then copy from browser and paste',
      'Set as default for new messages and/or replies',
      'Click "Save" or "OK"',
    ],
    tips: [
      '✓ Outlook uses Word\'s rendering engine - our signatures are optimized for this',
      '⚠️ Outlook 2010-2016 has limited HTML support - avoid using very complex signatures',
      '⚠️ If images don\'t show in Desktop: File → Options → Trust Center → Automatic Download → "Don\'t download pictures automatically"',
      '💡 Outlook Web has better HTML support than Desktop versions',
      '💡 If border-radius (rounded images) doesn\'t work in old Outlook, images will show as squares - this is normal',
    ],
  },
  apple: {
    steps: [
      'Click "Copy Signature" button above',
      'In Apple Mail: Mail → Settings (or Preferences on older macOS)',
      'Click "Signatures" tab',
      'Select your email account in the left column',
      'Click the "+" button to create new signature',
      '⚠️ CRITICAL: Uncheck "Always match my default message font" (this preserves your formatting)',
      'Give it a name, then paste in the editor on the right (Cmd+V)',
      'Close settings - changes save automatically',
      'Send a test email to verify formatting',
    ],
    tips: [
      '✓ The preview in Signatures preferences may look wrong - this is normal!',
      '✓ The signature will render correctly in actual emails',
      '⚠️ If you don\'t uncheck "Always match my default message font", your formatting will be lost',
      '💡 You can drag signatures to reorder them',
      '💡 To set a signature as default: Select account → Choose signature from dropdown',
    ],
  },
};

export const InstallationGuide: React.FC = () => {
  const [activeClient, setActiveClient] = useState<EmailClient>('gmail');

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">How to Install Your Signature</h2>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 p-1 space-x-1">
          <GuideTab client="gmail" activeClient={activeClient} onClick={setActiveClient}>Gmail</GuideTab>
          <GuideTab client="outlook" activeClient={activeClient} onClick={setActiveClient}>Outlook</GuideTab>
          <GuideTab client="apple" activeClient={activeClient} onClick={setActiveClient}>Apple Mail</GuideTab>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Installation Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            {instructions[activeClient].steps.map((step, index) => (
              <li key={index} className="text-sm leading-relaxed">{step}</li>
            ))}
          </ol>

          <h3 className="font-semibold text-gray-800 mb-3 mt-6">Tips & Troubleshooting</h3>
          <ul className="space-y-2">
            {instructions[activeClient].tips.map((tip, index) => (
              <li key={index} className="text-xs text-gray-600 leading-relaxed flex items-start">
                <span className="mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};