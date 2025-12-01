import React, { useEffect, useState } from 'react';

interface SaveSignatureModalProps {
  open: boolean;
  initialName: string;
  initialLabel: string;
  onCancel: () => void;
  onConfirm: (name: string, label: string) => void;
  saving: boolean;
  error?: string | null;
}

const LABEL_OPTIONS = ['Personal', 'Work', 'Sales', 'Marketing', 'Other'];

export const SaveSignatureModal: React.FC<SaveSignatureModalProps> = ({
  open,
  initialName,
  initialLabel,
  onCancel,
  onConfirm,
  saving,
  error,
}) => {
  const [name, setName] = useState(initialName);
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    if (open) {
      setName(initialName || '');
      setLabel(initialLabel || 'Personal');
    }
  }, [open, initialName, initialLabel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Save signature</h3>
            <p className="text-sm text-gray-500">Add a friendly name and a tag so you can find it later.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Firma principal"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label / Tag</label>
            <div className="flex gap-2">
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              >
                {LABEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Personal / Ventas / Equipo"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Puedes elegir o escribir tu propia etiqueta para buscar después.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition">Cancel</button>
          <button
            onClick={() => onConfirm(name, label)}
            className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
