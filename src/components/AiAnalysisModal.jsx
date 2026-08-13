import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function AiAnalysisModal({ isOpen, onClose, user, totalBalance, expenseByCategory }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateAnalysis();
    } else {
      setAnalysis('');
      setError('');
    }
  }, [isOpen]);

  const generateAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Ambil profil user terbaru dari database
      const { data: profile, error: dbError } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (dbError) throw new Error("Gagal mengambil profil pengguna.");

      // 2. Hitung hari tersisa dalam bulan ini
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysLeft = lastDay.getDate() - today.getDate();

      // 3. Susun konteks untuk Gemini
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Gemini tidak ditemukan di .env!");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const prompt = `
Kamu adalah penasihat keuangan pribadi yang bijak, ramah, dan solutif.
Tugasmu adalah menganalisis kondisi keuangan pengguna berikut dan memberikan rekomendasi apakah mereka boros dan bagaimana agar uangnya cukup sampai akhir bulan.

Data Pengguna:
- Nama: ${user.name}
- Total Saldo Saat Ini: ${formatCurrency(totalBalance)}
- Sisa Hari di Bulan Ini: ${daysLeft} hari
- Tempat Tinggal: ${profile.residence || 'Tidak diisi'}
- Tempat Kerja: ${profile.workplace || 'Tidak diisi'}
- Biaya Transport Berangkat: ${formatCurrency(profile.transport_go_cost || 0)} (${profile.transport_go || '-'})
- Biaya Transport Pulang: ${formatCurrency(profile.transport_return_cost || 0)} (${profile.transport_return || '-'})
- Makan per Hari: ${profile.meals_per_day || 0} kali
- Rata-rata Sekali Makan: ${formatCurrency(profile.cost_per_meal || 0)}
- Kategori Pengeluaran Bulan Ini: ${JSON.stringify(expenseByCategory)}

Instruksi:
1. Hitung total perkiraan biaya hidup rutin harian (transport + makan) dikalikan sisa hari (${daysLeft} hari).
2. Bandingkan dengan Total Saldo Saat Ini. Apakah cukup, kurang, atau sangat berlebih?
3. Berikan penilaian apakah pengeluaran bulan ini cenderung boros atau tidak (berdasarkan kategori pengeluaran).
4. Berikan tips spesifik dan rekomendasi (jangan generik) agar saldo bertahan hingga akhir bulan, atau cara mengalokasikan sisa uang jika sangat berlebih.
5. Gunakan bahasa Indonesia yang santai, memotivasi, dan berikan emoji. Format jawaban menggunakan Markdown (bullet points, bold, dll).
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());

    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghubungi Gemini AI. Pastikan API key valid atau coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-brand-50 w-full max-w-3xl h-[85vh] rounded-3xl flex flex-col shadow-glow-lg relative transform transition-all overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-brand-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-brand-500 p-2 rounded-xl text-white shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">Analisis Keuangan AI</h2>
              <p className="text-xs text-gray-500 font-medium">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white/50 hover:bg-white p-2 rounded-full transition shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto bg-gray-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-semibold text-gray-600">Gemini sedang menganalisis dompetmu...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 text-sm font-medium">
              {error}
            </div>
          ) : (
            <div className="prose prose-pink prose-sm sm:prose-base max-w-none text-gray-700">
              {/* Simple Markdown Renderer for the analysis text */}
              {analysis.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-2 text-gray-800">{line.replace('## ', '')}</h3>;
                if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-2 text-gray-900">{line.replace('# ', '')}</h2>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-1">{line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</li>;
                if (line.trim() === '') return <br key={i} />;
                
                // Bold formatting
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
