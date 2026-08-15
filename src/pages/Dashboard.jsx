import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  LogOut, Wallet, TrendingUp, TrendingDown, 
  Plus, Sparkles, CreditCard, Activity, PieChart as PieChartIcon, UserCog, Edit2, Trash2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import TransactionModal from '../components/TransactionModal';
import WalletModal from '../components/WalletModal';
import ProfileModal from '../components/ProfileModal';
import AiAnalysisModal from '../components/AiAnalysisModal';
import PrintableReport from '../components/PrintableReport';

const quotes = [
  "Berhemat bukan berarti pelit, tapi tentang menata masa depan kita berdua.",
  "Uang bisa dicari, tapi waktu bersamamu tak terganti. Yuk hemat agar kita bisa liburan lagi!",
  "Menabung sedikit demi sedikit, lama-lama jadi bukit untuk modal nikah kita.",
  "Cinta tak butuh kemewahan, cukup kesetiaan dan tabungan masa depan yang aman.",
  "Setiap rupiah yang kita simpan adalah satu langkah lebih dekat menuju mimpi kita bersama.",
  "Bukan seberapa besar pendapatan kita, tapi seberapa pintar kita merawatnya berdua.",
  "Romantis itu bukan cuma makan malam mewah, tapi merencanakan keuangan berdua tanpa resah.",
  "Disiplin finansial hari ini adalah jaminan ketenangan keluarga kita esok hari.",
  "Hemat hari ini, sejahtera esok hari. Bersamamu segalanya terasa lebih berarti.",
  "Masa depan yang indah tidak hanya dibangun dengan cinta, tapi juga dengan rencana keuangan yang nyata.",
  "Mencintaimu adalah investasiku yang paling berharga, dan berhemat adalah cara menjaganya.",
  "Keuangan yang sehat, hubungan yang kuat. Mari wujudkan semua cita-cita kita."
];

export default function Dashboard() {
  const { user, partner, logout } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(user);
  const [greeting, setGreeting] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');
  const [visibleTxCount, setVisibleTxCount] = useState(10);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const chartScrollRef = useRef(null);

  useEffect(() => {
    // Set Greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setGreeting('Selamat Pagi');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Set Random Quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (viewingUser) {
      fetchData(viewingUser.id);
    }
  }, [viewingUser]);

  const fetchData = async (userId) => {
    const { data: wData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (wData) setWallets(wData);

    const { data: tData } = await supabase
      .from('transactions')
      .select('*, wallets(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (tData) setTransactions(tData);
  };

  const handleDeleteTransaction = async (txId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', txId);
      if (error) {
        alert('Gagal menghapus transaksi');
        console.error(error);
      } else {
        fetchData(user.id);
      }
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income' && !['Transfer Dompet', 'Topup'].includes(t.category))
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && !['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const chartData = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    
    const dayTx = transactions.filter(t => {
      if (['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category)) return false;
      const tDate = new Date(t.created_at);
      return tDate.getDate() === i && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const income = dayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    chartData.push({ name: dateStr, income, expense });
  }

  useEffect(() => {
    if (chartScrollRef.current) {
      const scrollContainer = chartScrollRef.current;
      const todayDate = new Date().getDate();
      const totalDays = chartData.length || 1; // avoid division by zero
      
      // Calculate scroll position to put today's date roughly in the center
      const targetRatio = todayDate / totalDays;
      const targetScroll = (scrollContainer.scrollWidth * targetRatio) - (scrollContainer.clientWidth / 2);
      
      scrollContainer.scrollLeft = Math.max(0, targetScroll);
    }
  }, [chartData]);

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense' && !['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category))
    .reduce((acc, t) => {
      acc[t.category || 'Lainnya'] = (acc[t.category || 'Lainnya'] || 0) + Number(t.amount);
      return acc;
    }, {});
    
  const pieData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  }));
  const COLORS = ['#ff6b8b', '#3b82f6', '#f59e0b', '#10b981', '#a855f7']; // Using pastel pink for primary

  return (
    <>
    <div className="min-h-screen bg-[#fafafc] relative overflow-hidden p-4 md:p-6 lg:p-8 font-sans text-gray-800 print:hidden">
      
      {/* Background Decorative Blobs for Glassmorphism Effect */}
      <div className="fixed top-0 left-[-10%] w-[500px] h-[500px] bg-brand-400/40 rounded-full blur-[100px] pointer-events-none -z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-300/40 rounded-full blur-[120px] pointer-events-none -z-0"></div>
      <div className="fixed top-[30%] left-[50%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-[100px] pointer-events-none -z-0"></div>

      <div className="relative z-10 w-full max-w-[100vw] overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="flex flex-wrap gap-4 justify-between items-center bg-white/60 backdrop-blur-xl px-4 md:px-6 py-4 rounded-3xl mb-8 shadow-glass border border-white/80">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DuoFinance" className="h-10 w-auto object-contain drop-shadow-sm" />
            <span className="text-xl font-bold text-gray-800">DuoFinance</span>
          </div>
        
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <div className="bg-white/50 rounded-full p-1 flex shadow-inner backdrop-blur-md">
            <button 
              onClick={() => setViewingUser(user)}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${viewingUser?.id === user.id ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {user.name} <span className="hidden sm:inline">(You)</span>
            </button>
            {partner && (
              <button 
                onClick={() => setViewingUser(partner)}
                className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${viewingUser?.id === partner.id ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {partner.name}
              </button>
            )}
          </div>
          <div className="flex gap-1 border-l border-gray-200 pl-4 ml-2">
            <button onClick={() => window.print()} className="text-brand-400 hover:text-brand-500 bg-brand-50 hover:bg-brand-100 p-2 rounded-full transition" title="Unduh Laporan (PDF)">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <button onClick={() => setIsProfileModalOpen(true)} className="text-gray-400 hover:text-brand-400 p-2 transition ml-1" title="Profil & Biaya Hidup">
              <UserCog size={22} />
            </button>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 p-2 transition" title="Keluar">
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Greeting and Quote Section */}
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {greeting}, <span className="text-brand-400">{user.name}!</span>
        </h1>
        <p className="text-gray-500 italic text-sm md:text-base font-medium">"{dailyQuote}"</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 xl:gap-8 lg:col-span-1">
          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-brand-100 to-white rounded-3xl p-6 shadow-glow-soft border border-brand-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-200 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-gray-600 font-medium mb-2">Total Saldo</h3>
            <div className="text-4xl font-extrabold text-gray-900 mb-4">{formatCurrency(totalBalance)}</div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-brand-500 bg-brand-50 px-2.5 py-1 rounded-lg font-semibold shadow-sm">
                <TrendingUp size={14} className="mr-1" />
                Active
              </span>
              <span className="text-gray-500 font-medium">Update realtime</span>
            </div>
          </div>

          {/* Wallets List */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">Dompet / Rekening</h3>
              <button 
                className="text-brand-400 hover:text-brand-500 font-semibold text-sm flex items-center bg-brand-50 px-3 py-1.5 rounded-full transition"
                onClick={() => setIsWalletModalOpen(true)}
                disabled={viewingUser?.id !== user.id}
              >
                <Plus size={16} className="mr-1" /> Tambah
              </button>
            </div>
            <div className="space-y-3 flex-grow overflow-y-auto">
              {wallets.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Belum ada dompet.</p>
              ) : (
                wallets.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-3 hover:bg-brand-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-brand-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 text-brand-400 flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{w.name}</div>
                        <div className="text-xs text-gray-400 font-medium">Main Account</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">{formatCurrency(w.balance)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 xl:gap-8">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-glass border border-white/80 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50/80 text-emerald-500 flex items-center justify-center shadow-sm border border-white/50 shrink-0">
                <TrendingUp size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">Pemasukan Bulan Ini</div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{formatCurrency(totalIncome)}</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-glass border border-white/80 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50/80 text-rose-500 flex items-center justify-center shadow-sm border border-white/50 shrink-0">
                <TrendingDown size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">Pengeluaran Bulan Ini</div>
                <div className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{formatCurrency(totalExpense)}</div>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-glass border border-white/80 flex-grow flex flex-col min-h-[350px] overflow-hidden w-full">
            <div className="flex justify-between items-center mb-4 sm:mb-8">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-400"><Activity size={18} /></div> Analisis Arus Kas
              </h3>
            </div>
            <div className="flex-grow w-full min-w-0 relative h-[300px]">
              <div 
                ref={chartScrollRef}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div style={{ width: `${Math.max(100, (chartData.length / 6) * 100)}%`, height: '100%', minWidth: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b8b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ff6b8b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                      itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#ff6b8b" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 xl:gap-8 lg:col-span-1">
          
          {/* Quick Actions */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsTxModalOpen(true)}
                disabled={viewingUser?.id !== user.id}
                className="bg-brand-400 hover:bg-brand-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-glow hover:shadow-glow-lg transform hover:-translate-y-1"
              >
                <Plus size={28} />
                <span className="text-sm font-semibold text-center">Transaksi</span>
              </button>
              <button 
                onClick={() => setIsAiModalOpen(true)}
                disabled={viewingUser?.id !== user.id}
                className="bg-gradient-to-br from-purple-500 to-brand-500 hover:from-purple-600 hover:to-brand-600 disabled:from-gray-300 disabled:to-gray-200 disabled:text-gray-400 text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-glass hover:shadow-glass-hover transform hover:-translate-y-1"
              >
                <Sparkles size={28} />
                <span className="text-sm font-semibold text-center">Analisis AI</span>
              </button>
            </div>
          </div>

          {/* Breakdown Pie Chart */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex-grow">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-6">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-400"><PieChartIcon size={18} /></div> Kategori
            </h3>
            {pieData.length > 0 ? (
              <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 mb-6 flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50 rounded-2xl">
                Belum ada data
              </div>
            )}
            <div className="space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-gray-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Transactions List - Full width at bottom */}
      <div className="mt-6 xl:mt-8 bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Transaksi Terakhir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.length === 0 ? (
             <p className="text-gray-400 text-sm italic col-span-full">Belum ada transaksi.</p>
          ) : (
            transactions.slice(0, visibleTxCount).map(t => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-brand-50 rounded-2xl transition border border-transparent hover:border-brand-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 text-brand-500'}`}>
                    {t.type === 'income' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-0.5">{t.description}</div>
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                      <span>{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-brand-500">{t.category || t.wallets?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`font-extrabold ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                  {viewingUser?.id === user.id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setTransactionToEdit(t);
                          setIsTxModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-brand-500 p-1 rounded-md transition"
                        title="Edit Transaksi"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-gray-400 hover:text-rose-500 p-1 rounded-md transition"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {transactions.length > visibleTxCount && (
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setVisibleTxCount(prev => prev + 10)}
              className="text-brand-500 hover:text-brand-600 font-bold bg-brand-50 hover:bg-brand-100 px-6 py-2.5 rounded-xl transition"
            >
              Tampilkan selengkapnya
            </button>
          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => {
          setIsTxModalOpen(false);
          setTransactionToEdit(null);
        }} 
        wallets={wallets} 
        user={user}
        transactionToEdit={transactionToEdit}
        onSuccess={() => fetchData(user.id)}
      />

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        user={user}
        onSuccess={() => fetchData(user.id)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSuccess={() => fetchData(user.id)}
      />

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        user={user}
        totalBalance={totalBalance}
        expenseByCategory={expenseByCategory}
      />
      </div>
    </div>
    
    <PrintableReport 
      user={viewingUser} 
      transactions={transactions} 
      totalIncome={totalIncome} 
      totalExpense={totalExpense} 
    />
    </>
  );
}
