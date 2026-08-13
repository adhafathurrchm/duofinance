import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    residence: '',
    workplace: '',
    transport_go: '',
    transport_go_cost: 0,
    transport_return: '',
    transport_return_cost: 0,
    meals_per_day: 3,
    cost_per_meal: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      // Fetch fresh user data just in case
      const fetchUserData = async () => {
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (data && !error) {
          setFormData({
            residence: data.residence || '',
            workplace: data.workplace || '',
            transport_go: data.transport_go || '',
            transport_go_cost: data.transport_go_cost || 0,
            transport_return: data.transport_return || '',
            transport_return_cost: data.transport_return_cost || 0,
            meals_per_day: data.meals_per_day || 3,
            cost_per_meal: data.cost_per_meal || 0
          });
        }
      };
      fetchUserData();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          residence: formData.residence,
          workplace: formData.workplace,
          transport_go: formData.transport_go,
          transport_go_cost: Number(formData.transport_go_cost) || 0,
          transport_return: formData.transport_return,
          transport_return_cost: Number(formData.transport_return_cost) || 0,
          meals_per_day: Number(formData.meals_per_day) || 0,
          cost_per_meal: Number(formData.cost_per_meal) || 0
        })
        .eq('id', user.id);
      
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-brand-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-glow-lg relative transform transition-all">
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-brand-50 p-2 rounded-full transition">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Profil & Biaya Hidup</h2>
        <p className="text-gray-500 mb-6 text-sm">Data ini akan digunakan oleh AI untuk memberikan rekomendasi keuangan.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tempat Tinggal (Domisili)</label>
              <input type="text" name="residence" value={formData.residence} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800 shadow-sm" placeholder="Cth: Kos Jakarta Selatan" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tempat Kerja / Kuliah</label>
              <input type="text" name="workplace" value={formData.workplace} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-800 shadow-sm" placeholder="Cth: Sudirman" />
            </div>
          </div>

          <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100">
            <h3 className="font-bold text-gray-800 mb-4">Transportasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transport Berangkat</label>
                <input type="text" name="transport_go" value={formData.transport_go} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" placeholder="Cth: KRL & Ojol" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Biaya Berangkat (Rp)</label>
                <input type="number" name="transport_go_cost" value={formData.transport_go_cost} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transport Pulang</label>
                <input type="text" name="transport_return" value={formData.transport_return} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" placeholder="Cth: TransJakarta" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Biaya Pulang (Rp)</label>
                <input type="number" name="transport_return_cost" value={formData.transport_return_cost} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-gray-800 mb-4">Konsumsi Harian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah Makan Sehari</label>
                <input type="number" name="meals_per_day" value={formData.meals_per_day} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" placeholder="Cth: 3" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rata-rata Sekali Makan (Rp)</label>
                <input type="number" name="cost_per_meal" value={formData.cost_per_meal} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-400 text-sm shadow-sm" placeholder="Cth: 20000" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl mt-2 transition duration-300 shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5"
          >
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>
    </div>
  );
}
