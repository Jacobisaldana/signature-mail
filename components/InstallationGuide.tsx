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
  gmail: [
    'Copy the desired signature HTML using the "Copy" button.',
    'In Gmail, go to Settings > See all settings.',
    'Under the "General" tab, scroll down to the "Signature" section.',
    'Click "Create new", give your signature a name, and paste the copied HTML into the editor box.',
    'Configure your signature defaults for new emails and replies.',
    'Scroll to the bottom and click "Save Changes".',
  ],
  outlook: [
    'Copy the desired signature HTML using the "Copy" button.',
    'In the Outlook desktop app, go to File > Options > Mail > Signatures.',
    'Click "New", provide a name, and click OK.',
    'In the editor, paste your signature. Note: For best results, sometimes it is better to open the HTML in a web browser, select all (Ctrl+A), copy the visual content, and then paste that into the Outlook editor.',
    'Set your default signature for new messages and replies/forwards.',
    'Click "OK" to save.',
  ],
  apple: [
    'Copy the desired signature HTML using the "Copy" button.',
    'In Apple Mail, open Mail > Preferences (or Settings).',
    'Go to the "Signatures" tab.',
    'Select the email account you want to associate the signature with and click the "+" button.',
    'Give your signature a name. IMPORTANT: Uncheck the "Always match my default message font" option.',
    'Paste the signature into the signature editor box on the right.',
    'Close the preferences window to save. The signature may not look correct in the preview, but it will render correctly in actual emails.',
  ],
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
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            {instructions[activeClient].map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};