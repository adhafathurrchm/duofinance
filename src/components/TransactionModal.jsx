import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, wallets, user, transactionToEdit, onSuccess }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount);
        setDescription(transactionToEdit.description);
        setWalletId(transactionToEdit.wallet_id);
        
        const defaultCategories = transactionToEdit.type === 'expense' 
          ? ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Transfer Dompet', 'Lainnya']
          : ['Gaji', 'Bonus', 'Investasi', 'Topup', 'Saldo Awal', 'Lainnya'];
          
        if (defaultCategories.includes(transactionToEdit.category)) {
          setCategory(transactionToEdit.category);
          setCustomCategory('');
        } else {
          setCategory('Lainnya');
          setCustomCategory(transactionToEdit.category || '');
        }
        setDate(new Date(transactionToEdit.created_at).toISOString().split('T')[0]);
      } else {
        setType('expense');
        setAmount('');
        setDescription('');
        setCategory('');
        setCustomCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        if (wallets.length > 0) {
          if (!walletId || !wallets.find(w => w.id === walletId)) {
            setWalletId(wallets[0].id);
          }
        }
      }
    }
  }, [isOpen, transactionToEdit, wallets]);

  if (!isOpen) return null;

  const categories = type === 'expense' 
    ? ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Transfer Dompet', 'Lainnya']
    : ['Gaji', 'Bonus', 'Investasi', 'Topup', 'Saldo Awal', 'Lainnya'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletId) return alert('Silakan tambah dompet terlebih dahulu');
    setLoading(true);
    
    try {
      // Preserve exact time for accurate sorting
      let finalDateTime;
      const [year, month, day] = date.split('-');
      
      if (transactionToEdit) {
        const origDate = new Date(transactionToEdit.created_at);
        origDate.setFullYear(year, month - 1, day);
        finalDateTime = origDate.toISOString();
      } else {
        const now = new Date();
        now.setFullYear(year, month - 1, day);
        finalDateTime = now.toISOString();
      }

      const txData = {
        user_id: user.id,
        wallet_id: walletId,
        type,
        amount: Number(amount),
        description,
        category: category === 'Lainnya' ? (customCategory || 'Lainnya') : category,
        created_at: finalDateTime
      };
      
      let error;
      if (transactionToEdit) {
        const { error: updateError } = await supabase.from('transactions').update(txData).eq('id', transactionToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('transactions').insert(txData);
        error = insertError;
      }
      
      if (error) throw error;
      onSuccess();
      onClose();
      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setCustomCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan transaksi');
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
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-6 border border-gray-100">
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${type === 'expense' ? 'bg-white text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setType('expense')}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${type === 'income' ? 'bg-white text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setType('income')}
            >
              Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nominal (Rp)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth: Beli kopi, Gaji..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 shadow-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dompet / Saldo</label>
              <select
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 shadow-sm"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
              >
                {wallets.length === 0 && <option value="">-</option>}
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
            <select
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 shadow-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Pilih</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {category === 'Lainnya' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kategori Baru</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="cth: Hadiah, Donasi..."
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition duration-300 shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  );
}
