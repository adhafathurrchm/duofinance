import React from 'react';

export default function PrintableReport({ user, transactions, totalIncome, totalExpense }) {
  const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const reportTransactions = transactions
    .filter(t => !['Transfer Dompet', 'Topup', 'Saldo Awal'].includes(t.category))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans">
      <div className="flex justify-between items-end border-b-2 border-gray-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="DuoFinance Logo" className="h-14 w-auto object-contain" />
            <span className="text-2xl font-bold text-gray-800">DuoFinance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900">Laporan Keuangan</h1>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-800">{user?.name}</p>
          <p className="text-sm font-medium text-gray-500 mt-1">Periode: 1 {currentMonth} - Akhir {currentMonth}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Pemasukan</p>
          <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Pengeluaran</p>
          <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Sisa Bersih (Net)</p>
          <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalIncome - totalExpense)}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-3 text-gray-800">Rincian Transaksi</h3>
      <table className="w-full text-left text-sm mb-10">
        <thead>
          <tr className="border-b-2 border-gray-400">
            <th className="py-3 px-2 font-bold text-gray-700">Tanggal</th>
            <th className="py-3 px-2 font-bold text-gray-700">Keterangan</th>
            <th className="py-3 px-2 font-bold text-gray-700">Kategori</th>
            <th className="py-3 px-2 font-bold text-gray-700 text-right">Pemasukan</th>
            <th className="py-3 px-2 font-bold text-gray-700 text-right">Pengeluaran</th>
          </tr>
        </thead>
        <tbody>
          {reportTransactions.length === 0 ? (
            <tr><td colSpan="5" className="py-8 text-center text-gray-400 font-medium">Tidak ada transaksi di periode ini</td></tr>
          ) : (
            reportTransactions.map((t, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-2 font-medium text-gray-600">{new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</td>
                <td className="py-3 px-2 font-semibold text-gray-800">{t.description}</td>
                <td className="py-3 px-2 font-medium text-gray-500">{t.category}</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">
                  {t.type === 'income' ? formatCurrency(t.amount) : '-'}
                </td>
                <td className="py-3 px-2 text-right text-rose-600 font-bold">
                  {t.type === 'expense' ? formatCurrency(t.amount) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-32 pt-8 border-t-2 border-gray-200 flex justify-between items-center text-sm font-medium text-gray-400">
        <p>Dicetak secara otomatis oleh DuoFinance App</p>
        <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  );
}
