import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  Receipt,
  TrendingUp,
  CreditCard,
  Printer,
  Sparkles,
  ShoppingBag,
  Search,
  Filter
} from 'lucide-react';
import { Transaction, KopmaSettings } from '../../types';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';

interface ReportsDashboardProps {
  transactions: Transaction[];
  settings: KopmaSettings;
  onViewReceipt: (tx: Transaction) => void;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  transactions,
  settings,
  onViewReceipt,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchInvoice, setSearchInvoice] = useState('');

  // Filter transactions based on date
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 3600 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime();
      let matchDate = true;

      if (dateFilter === 'today') {
        matchDate = txTime >= todayStart;
      } else if (dateFilter === 'week') {
        matchDate = txTime >= weekStart;
      } else if (dateFilter === 'month') {
        matchDate = txTime >= monthStart;
      }

      const q = searchInvoice.toLowerCase().trim();
      const matchSearch =
        !q ||
        tx.invoiceNumber.toLowerCase().includes(q) ||
        (tx.memberName && tx.memberName.toLowerCase().includes(q)) ||
        (tx.memberNak && tx.memberNak.toLowerCase().includes(q)) ||
        tx.paymentMethod.toLowerCase().includes(q);

      return matchDate && matchSearch;
    });
  }, [transactions, dateFilter, searchInvoice]);

  // Aggregate Metrics
  const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.totalNet, 0);
  const totalTransactionsCount = filteredTransactions.length;
  const totalMemberSavings = filteredTransactions.reduce(
    (sum, tx) => sum + tx.memberDiscountSavings,
    0
  );

  // Estimasi Laba Kotor
  const totalGrossProfit = filteredTransactions.reduce((sum, tx) => {
    const cost = tx.items.reduce(
      (itemCostSum, item) => itemCostSum + item.product.costPrice * item.quantity,
      0
    );
    return sum + (tx.totalNet - cost);
  }, 0);

  // Payment Breakdown
  const paymentStats = useMemo(() => {
    const breakdown = { cash: 0, qris: 0, savings: 0, transfer: 0 };
    filteredTransactions.forEach((tx) => {
      if (breakdown[tx.paymentMethod] !== undefined) {
        breakdown[tx.paymentMethod] += tx.totalNet;
      }
    });
    return breakdown;
  }, [filteredTransactions]);

  // Member vs Non-Member breakdown
  const memberTxCount = filteredTransactions.filter((tx) => !!tx.memberId).length;
  const nonMemberTxCount = totalTransactionsCount - memberTxCount;
  const memberRevenue = filteredTransactions
    .filter((tx) => !!tx.memberId)
    .reduce((sum, tx) => sum + tx.totalNet, 0);
  const nonMemberRevenue = totalRevenue - memberRevenue;

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; totalRevenue: number }>();
    filteredTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const existing = map.get(item.product.id) || {
          name: item.product.name,
          qty: 0,
          totalRevenue: 0,
        };
        existing.qty += item.quantity;
        existing.totalRevenue += item.subtotal;
        map.set(item.product.id, existing);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Laporan Penjualan & Transaksi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rekap omzet, keuntungan kotor, riwayat nota transaksi kasir, dan kontribusi anggota Kopma.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateFilter === 'today'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateFilter === 'week'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateFilter === 'month'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateFilter === 'all'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Omzet Penjualan</span>
          <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            {formatRupiah(totalRevenue)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalTransactionsCount} Transaksi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Estimasi Laba Kotor</span>
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatRupiah(totalGrossProfit)}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Margin: {totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hemat Diskon Anggota</span>
          </span>
          <p className="text-2xl font-bold font-mono text-amber-800 mt-1">
            {formatRupiah(totalMemberSavings)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Manfaat nyata bagi anggota Kopma</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Rata-rata Transaksi (AOV)</span>
          <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
            {formatRupiah(totalTransactionsCount > 0 ? totalRevenue / totalTransactionsCount : 0)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Nilai keranjang rata-rata</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Payment Methods */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Metode Pembayaran
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">💵 Tunai (Cash)</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(paymentStats.cash)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">📱 QRIS Kopma</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(paymentStats.qris)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">💳 Saldo Simpanan Kopma</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(paymentStats.savings)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="font-medium text-slate-700">🏦 Transfer Bank</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(paymentStats.transfer)}
              </span>
            </div>
          </div>
        </div>

        {/* Member vs Non-member breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Kontribusi Anggota vs Umum
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-emerald-800">Anggota Kopma ({memberTxCount} tx)</span>
                <span className="font-mono font-bold">{formatRupiah(memberRevenue)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${totalRevenue > 0 ? (memberRevenue / totalRevenue) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-600">Pelanggan Umum ({nonMemberTxCount} tx)</span>
                <span className="font-mono font-bold">{formatRupiah(nonMemberRevenue)}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{
                    width: `${totalRevenue > 0 ? (nonMemberRevenue / totalRevenue) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            5 Produk Paling Laris
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada data penjualan.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="line-clamp-1 max-w-[140px] text-slate-800 font-medium">
                      {p.name}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900">{p.qty} terjual</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Transaksi Lengkap</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No Nota / Pembeli..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-3 py-2.5">No. Nota</th>
                <th className="px-3 py-2.5">Waktu</th>
                <th className="px-3 py-2.5">Kasir</th>
                <th className="px-3 py-2.5">Pelanggan</th>
                <th className="px-3 py-2.5">Item</th>
                <th className="px-3 py-2.5">Metode</th>
                <th className="px-3 py-2.5 text-right">Total Akhir</th>
                <th className="px-3 py-2.5 text-right">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                      {tx.invoiceNumber}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {formatDateTimeIndo(tx.date)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{tx.cashierName}</td>
                    <td className="px-3 py-2.5">
                      {tx.memberName ? (
                        <div>
                          <span className="font-semibold text-emerald-800">{tx.memberName}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {tx.memberNak}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Umum</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {tx.items.reduce((s, i) => s + i.quantity, 0)} item
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800 font-mono">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-right text-slate-900">
                      {formatRupiah(tx.totalNet)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition"
                        title="Lihat / Cetak Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
