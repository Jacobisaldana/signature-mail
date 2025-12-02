import React, { useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Signature } from '../types';
import { SignaturePreview } from './SignaturePreview';

interface ProfilePageProps {
  user: User;
  signatures: Signature[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onEditSignature: (signature: Signature) => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
};

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  signatures,
  loading,
  error,
  onRefresh,
  onEditSignature,
}) => {
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<string>('all');

  const labelOptions = useMemo(() => {
    const labels = Array.from(new Set(signatures.map((s) => s.label).filter(Boolean)));
    return labels;
  }, [signatures]);

  const filteredSignatures = useMemo(() => {
    const term = search.toLowerCase();
    return signatures.filter((sig) => {
      const matchesLabel = labelFilter === 'all' || sig.label === labelFilter;
      const matchesText =
        !term ||
        sig.name.toLowerCase().includes(term) ||
        sig.label.toLowerCase().includes(term);
      return matchesLabel && matchesText;
    });
  }, [signatures, search, labelFilter]);

  const userName = (user.user_metadata as any)?.full_name || user.email || 'User';

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile</h2>
          <p className="text-sm text-gray-600 mb-4">Basic information from your Supabase account.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Name</p>
              <p className="text-gray-800 font-medium">{userName}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Email</p>
              <p className="text-gray-800 font-medium break-all">{user.email}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">User ID</p>
              <p className="text-gray-800 font-mono text-xs break-all">{user.id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500 uppercase tracking-wide text-xs mb-1">Created</p>
              <p className="text-gray-800 font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">My signatures</h3>
          <p className="text-3xl font-bold text-amber-600">{signatures.length}</p>
          <p className="text-xs text-gray-500">Saved in your account</p>
          <button
            onClick={onRefresh}
            className="mt-4 w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Refresh list
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Saved signatures</h3>
              <p className="text-sm text-gray-500">Search by name or label and jump back to the editor whenever you need.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              />
              <select
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              >
                <option value="all">All labels</option>
                {labelOptions.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {loading && <p className="text-sm text-gray-500">Loading signatures...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && filteredSignatures.length === 0 && (
            <p className="text-sm text-gray-500">You haven't saved any signatures yet. Design one in the editor and press “Save Signature”.</p>
          )}
          {filteredSignatures.map((signature) => (
            <SignaturePreview
              key={signature.id}
              signature={signature}
              onEdit={() => onEditSignature(signature)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
