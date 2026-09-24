import React, { useState } from 'react';
import { ShieldCheck, X, DollarSign, Calculator, Printer, CheckCircle, Clock } from 'lucide-react';
import { CashierShift, KopmaSettings } from '../../types';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: CashierShift;
  settings: KopmaSettings;
  onCloseShift: (actualCash: number, newOpeningCash: number, newCashierName: string) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  settings,
  onCloseShift,
}) => {
  const [actualCashInput, setActualCashInput] = useState<number>(shift.expectedCash);
  const [nextOpeningCash, setNextOpeningCash] = useState<number>(200000);
  const [nextCashierName, setNextCashierName] = useState<string>(shift.cashierName);
  const [isClosingProcess, setIsClosingProcess] = useState(false);

  if (!isOpen) return null;

  const variance = actualCashInput - shift.expectedCash;

  const handleEndShift = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(actualCashInput, nextOpeningCash, nextCashierName);
    setIsClosingProcess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Shift & Rekonsiliasi Kasir Kopma</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isClosingProcess ? (
          <div className="p-5 space-y-4">
            {/* Shift Summary Cards */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas Kasir:</span>
                <span className="font-bold text-slate-800">{shift.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mulai Shift:</span>
                <span className="font-mono text-slate-700">{formatDateTimeIndo(shift.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase">
                  Aktif Berjalan
                </span>
              </div>
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Modal Awal Laci Kasir:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(shift.openingCash)}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                <span>Total Penjualan Tunai (+):</span>
                <span className="font-mono font-bold">{formatRupiah(shift.cashSales)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600">Penjualan Non-Tunai (QRIS/Bank):</span>
                <span className="font-mono font-bold text-slate-700">
                  {formatRupiah(shift.nonCashSales)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-emerald-800 text-white rounded-xl shadow-xs">
                <span className="font-bold">Total Uang Kas di Laci:</span>
                <span className="font-mono font-extrabold text-base">
                  {formatRupiah(shift.expectedCash)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setActualCashInput(shift.expectedCash);
                  setIsClosingProcess(true);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Tutup Shift & Serah Terima
              </button>
            </div>
          </div>
        ) : (
          /* End Shift Reconciliation Form */
          <form onSubmit={handleEndShift} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hitung Fisik Uang Kas di Laci (Rp) *
              </label>
              <input
                type="number"
                required
                step="500"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base font-mono font-bold focus:outline-emerald-500"
              />
            </div>

            {/* Selisih Indicator */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between font-medium ${
                variance === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : variance > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span>Selisih Kas Laci:</span>
              <span className="font-mono font-bold text-sm">
                {variance === 0
                  ? 'PAS (Rp 0)'
                  : variance > 0
                  ? `LEBIH (+${formatRupiah(variance)})`
                  : `KURANG (${formatRupiah(variance)})`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Setup Shift Selanjutnya
              </h4>
              <div>
                <label className="block text-slate-600 mb-1">Nama Petugas Kasir Berikutnya:</label>
                <input
                  type="text"
                  required
                  value={nextCashierName}
                  onChange={(e) => setNextCashierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">
                  Tinggalkan Modal Awal Laci (Rp):
                </label>
                <input
                  type="number"
                  required
                  step="50000"
                  value={nextOpeningCash}
                  onChange={(e) => setNextOpeningCash(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsClosingProcess(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
              >
                Simpan & Tutup Shift
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
