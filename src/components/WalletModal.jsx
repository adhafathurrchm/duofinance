import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

export default function WalletModal({ isOpen, onClose, user, onSuccess }) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('wallets').insert({
        user_id: user.id,
        name,
        balance: Number(balance) || 0
      });
      
      if (error) throw error;
      onSuccess();
      onClose();
      setName('');
      setBalance('');
    } catch (error) {
      console.error(error);
      alert('Gagal menambah dompet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-brand-50 w-full max-w-md rounded-3xl p-8 shadow-glow-lg relative transform transition-all">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-brand-50 p-2 rounded-full transition">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Tambah Dompet / Saldo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Dompet (cth: Dana, BCA)</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ShopeePay"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Saldo Awal (Rp)</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition duration-300 shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
          >
            {loading ? 'Menyimpan...' : 'Simpan Dompet'}
          </button>
        </form>
      </div>
    </div>
  );
}
