import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Signed in');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          setMessage('Account created. Redirecting...');
        } else {
          setMessage('Sign up successful. Check your email to confirm.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white border rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{mode === 'signin' ? 'Inicia sesión' : 'Crear cuenta'}</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button type="submit" disabled={loading} className="w-full py-2 bg-amber-500 text-black font-semibold rounded hover:bg-amber-600 disabled:opacity-50">
            {loading ? 'Cargando…' : mode === 'signin' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {mode === 'signin' ? (
            <button className="text-amber-600 hover:underline" onClick={() => setMode('signup')}>Crear cuenta</button>
          ) : (
            <button className="text-amber-600 hover:underline" onClick={() => setMode('signin')}>¿Ya tienes cuenta? Inicia sesión</button>
          )}
        </div>
      </div>
    </div>
  );
};
