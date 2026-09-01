import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  LogOut, TrendingUp, TrendingDown, Activity, History, 
  PieChart as PieChartIcon, UserCog, Calendar, Search, Filter, ArrowLeftRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ProfileModal from '../components/ProfileModal';
import PrintableReport from '../components/PrintableReport';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function HistoryPage() {
  const { user, partner, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [viewingUser, setViewingUser] = useState(user);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense

  const chartScrollRef = useRef(null);

  useEffect(() => {
    if (viewingUser) {
      fetchData(viewingUser.id);
    }
  }, [viewingUser]);

  const fetchData = async (userId) => {
    const { data: tData } = await supabase
      .from('transactions')
      .select('*, wallets(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    if (tData) setTransactions(tData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Filter transactions by selected month & year
  const selectedMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.created_at);
    return tDate.getMonth() === Number(selectedMonth) && tDate.getFullYear() === Number(selectedYear);
  });

  const totalIncome = selectedMonthTransactions
    .filter(t => t.type === 'income' && !['Transfer Dompet', 'Topup'].includes(t.category))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = selectedMonthTransactions
    .filter(t => t.type === 'expense' && !['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  // Chart data for selected month
  const daysInMonth = new Date(selectedYear, Number(selectedMonth) + 1, 0).getDate();
  const chartData = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${i} ${MONTH_NAMES[selectedMonth].substring(0, 3)}`;
    
    const dayTx = selectedMonthTransactions.filter(t => {
      if (['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category)) return false;
      const tDate = new Date(t.created_at);
      return tDate.getDate() === i;
    });
    
    const income = dayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    chartData.push({ name: dateStr, income, expense });
  }

  // Category expense breakdown for selected month
  const expenseByCategory = selectedMonthTransactions
    .filter(t => t.type === 'expense' && !['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category))
    .reduce((acc, t) => {
      acc[t.category || 'Lainnya'] = (acc[t.category || 'Lainnya'] || 0) + Number(t.amount);
      return acc;
    }, {});
    
  const pieData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  }));
  const COLORS = ['#ff6b8b', '#3b82f6', '#f59e0b', '#10b981', '#a855f7'];

  // Filtered transactions list by search and type
  const filteredTxList = selectedMonthTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.wallets?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Year options list (current year back 3 years)
  const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <>
      <div className="min-h-screen bg-[#fafafc] relative overflow-hidden p-4 md:p-6 lg:p-8 font-sans text-gray-800 print:hidden">
        
        {/* Background Decorative Blobs */}
        <div className="fixed top-0 left-[-10%] w-[500px] h-[500px] bg-brand-400/40 rounded-full blur-[100px] pointer-events-none -z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-300/40 rounded-full blur-[120px] pointer-events-none -z-0"></div>
        <div className="fixed top-[30%] left-[50%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-[100px] pointer-events-none -z-0"></div>

        <div className="relative z-10 w-full max-w-[100vw] overflow-hidden">
          
          {/* Top Navigation Bar */}
          <nav className="flex flex-wrap gap-4 justify-between items-center bg-white/60 backdrop-blur-xl px-4 md:px-6 py-4 rounded-3xl mb-8 shadow-glass border border-white/80">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="DuoFinance" className="h-10 w-auto object-contain drop-shadow-sm" />
                <span className="text-xl font-bold text-gray-800">DuoFinance</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-full text-xs font-semibold">
                <Link to="/" className="px-3.5 py-1.5 rounded-full text-gray-500 hover:text-gray-800 transition flex items-center gap-1.5">
                  <Activity size={14} /> Dashboard
                </Link>
                <Link to="/history" className="px-3.5 py-1.5 rounded-full bg-white text-brand-500 shadow-sm flex items-center gap-1.5 transition">
                  <History size={14} /> Riwayat Bulanan
                </Link>
              </div>
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
                <button onClick={() => window.print()} className="text-brand-400 hover:text-brand-500 bg-brand-50 hover:bg-brand-100 p-2 rounded-full transition" title="Unduh Laporan Bulanan (PDF)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
                <button onClick={() => setIsProfileModalOpen(true)} className="text-gray-400 hover:text-brand-400 p-2 transition ml-1" title="Profil">
                  <UserCog size={22} />
                </button>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 p-2 transition" title="Keluar">
                  <LogOut size={22} />
                </button>
              </div>
            </div>
          </nav>

          {/* Page Header & Month/Year Selector */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-glass border border-white/80">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <History className="text-brand-500" /> Riwayat Keuangan Bulanan
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Pilih bulan dan tahun untuk melihat rekapan pemasukan, pengeluaran, serta detail transaksi.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/80 p-2 rounded-2xl border border-gray-200 shadow-sm">
              <Calendar className="text-brand-400 ml-2" size={20} />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer text-sm sm:text-base pr-2"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer text-sm sm:text-base pr-2 border-l border-gray-200 pl-3"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-white shrink-0">
                <TrendingUp size={26} />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 font-medium text-sm mb-1 truncate">
                  Pemasukan ({MONTH_NAMES[selectedMonth]} {selectedYear})
                </div>
                <div className="text-2xl font-extrabold text-gray-900 truncate">{formatCurrency(totalIncome)}</div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-white shrink-0">
                <TrendingDown size={26} />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 font-medium text-sm mb-1 truncate">
                  Pengeluaran ({MONTH_NAMES[selectedMonth]} {selectedYear})
                </div>
                <div className="text-2xl font-extrabold text-gray-900 truncate">{formatCurrency(totalExpense)}</div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white shrink-0 ${netBalance >= 0 ? 'bg-brand-50 text-brand-500' : 'bg-amber-50 text-amber-600'}`}>
                <ArrowLeftRight size={26} />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 font-medium text-sm mb-1 truncate">
                  Sisa Bersih (Net)
                </div>
                <div className={`text-2xl font-extrabold truncate ${netBalance >= 0 ? 'text-gray-900' : 'text-amber-600'}`}>
                  {formatCurrency(netBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 mb-8">
            
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex flex-col min-h-[350px]">
              <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-400"><Activity size={18} /></div> 
                Grafik Arus Kas ({MONTH_NAMES[selectedMonth]} {selectedYear})
              </h3>
              <div className="flex-grow w-full relative h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncomeHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenseHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b8b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ff6b8b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                      itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomeHist)" name="Pemasukan" />
                    <Area type="monotone" dataKey="expense" stroke="#ff6b8b" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseHist)" name="Pengeluaran" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80 flex flex-col">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-4">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-400"><PieChartIcon size={18} /></div> 
                Pengeluaran Kategori
              </h3>
              {pieData.length > 0 ? (
                <>
                  <div className="h-44 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
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
                  <div className="space-y-2 flex-grow overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-gray-600 font-medium truncate max-w-[120px]">{entry.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">{formatCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50 rounded-2xl min-h-[200px]">
                  Tidak ada pengeluaran di bulan ini
                </div>
              )}
            </div>

          </div>

          {/* Transactions List Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-glass border border-white/80">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-xl text-gray-800">Daftar Transaksi Lengkap</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Menampilkan {filteredTxList.length} transaksi untuk {MONTH_NAMES[selectedMonth]} {selectedYear}
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/80 pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-brand-400 transition"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-gray-200 shadow-sm text-xs font-semibold">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'all' ? 'bg-brand-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Semua
                  </button>
                  <button 
                    onClick={() => setFilterType('income')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Pemasukan
                  </button>
                  <button 
                    onClick={() => setFilterType('expense')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTxList.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50/50 rounded-2xl">
                  Tidak ditemukan transaksi pada bulan ini.
                </div>
              ) : (
                filteredTxList.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50/90 hover:bg-white rounded-2xl transition border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                        {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate mb-0.5">{t.description}</div>
                        <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
                          <span>{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-brand-500 font-semibold">{t.category || t.wallets?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-extrabold text-sm shrink-0 ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onSuccess={() => fetchData(user.id)}
        />

      </div>

      <PrintableReport 
        user={viewingUser} 
        transactions={selectedMonthTransactions} 
        totalIncome={totalIncome} 
        totalExpense={totalExpense} 
      />
    </>
  );
}
