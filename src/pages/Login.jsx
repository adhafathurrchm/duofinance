import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-3xl shadow-glow-soft border border-brand-50">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="DuoFinance Logo" className="h-24 w-auto object-contain drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">DuoFinance</h2>
        <p className="text-gray-500 text-center mb-8">Sign in to track your shared finances</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 transition shadow-sm"
              placeholder="you@duofinance.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 transition shadow-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-400 hover:bg-brand-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-300 shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
