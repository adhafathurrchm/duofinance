import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Wallet, Edit2, Trash2, Save } from 'lucide-react';

export default function WalletModal({ isOpen, onClose, user, wallets = [], walletToEdit = null, onSuccess }) {
  const [mode, setMode] = useState('add'); // 'add' | 'manage'
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletToEdit === 'manage') {
      setMode('manage');
      setEditingWalletId(null);
    } else if (walletToEdit && typeof walletToEdit === 'object') {
      setMode('manage');
      startEdit(walletToEdit);
    } else {
      setMode('add');
      setName('');
      setBalance('');
      setEditingWalletId(null);
    }
  }, [walletToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.from('wallets').insert({
        user_id: user.id,
        name: name.trim(),
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

  const startEdit = (w) => {
    setEditingWalletId(w.id);
    setEditName(w.name);
    setEditBalance(w.balance);
  };

  const handleUpdateWallet = async (walletId) => {
    if (!editName.trim()) {
      alert('Nama dompet tidak boleh kosong');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wallets')
        .update({
          name: editName.trim(),
          balance: Number(editBalance) || 0
        })
        .eq('id', walletId);

      if (error) throw error;
      setEditingWalletId(null);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Gagal memperbarui dompet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (wallet) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus dompet "${wallet.name}"?\nCatatan: Semua transaksi terkait dompet ini juga akan dihapus.`)) {
      setLoading(true);
      try {
        await supabase.from('transactions').delete().eq('wallet_id', wallet.id);
        const { error } = await supabase.from('wallets').delete().eq('id', wallet.id);
        if (error) throw error;
        onSuccess();
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus dompet');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-brand-50 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-glow-lg relative transform transition-all max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-brand-50 p-2 rounded-full transition"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
          <Wallet className="text-brand-400" size={24} />
          {mode === 'add' ? 'Tambah Dompet Baru' : 'Kelola / Edit Dompet'}
        </h2>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('add'); setEditingWalletId(null); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${mode === 'add' ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            + Tambah Dompet
          </button>
          <button
            type="button"
            onClick={() => setMode('manage')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${mode === 'manage' ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Edit / Hapus Dompet ({wallets.length})
          </button>
        </div>
        
        {mode === 'add' ? (
          <form onSubmit={handleAddSubmit} className="space-y-5 overflow-y-auto">
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
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1 flex-grow">
            {wallets.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Belum ada dompet untuk dikelola.</p>
            ) : (
              wallets.map(w => (
                <div key={w.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl transition hover:border-brand-100">
                  {editingWalletId === w.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Dompet</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Saldo (Rp)</label>
                        <input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800 font-semibold"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingWalletId(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-200 rounded-lg transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleUpdateWallet(w.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-brand-400 hover:bg-brand-500 rounded-lg transition flex items-center gap-1 shadow-sm"
                        >
                          <Save size={14} /> Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-gray-800 truncate">{w.name}</div>
                        <div className="text-xs text-gray-500 font-medium">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(w.balance)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(w)}
                          className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition"
                          title="Edit nama / saldo dompet"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleDeleteWallet(w)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus dompet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

