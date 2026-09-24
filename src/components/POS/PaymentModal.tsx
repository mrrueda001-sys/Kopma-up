import React, { useState, useEffect } from 'react';
import { X, Banknote, QrCode, Wallet, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { PaymentMethod, Member, KopmaSettings } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalNet: number;
  totalGross: number;
  totalSavings: number;
  activeMember: Member | null;
  settings: KopmaSettings;
  onConfirmPayment: (
    method: PaymentMethod,
    cashTendered?: number,
    change?: number,
    notes?: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalNet,
  totalGross,
  totalSavings,
  activeMember,
  settings,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(totalNet);
  const [qrisState, setQrisState] = useState<'waiting' | 'verifying' | 'success'>('waiting');
  const [notes, setNotes] = useState('');

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setCashTendered(totalNet);
      setQrisState('waiting');
      setNotes('');
    }
  }, [isOpen, totalNet]);

  if (!isOpen) return null;

  const change = Math.max(0, cashTendered - totalNet);
  const isCashInsufficient = method === 'cash' && cashTendered < totalNet;
  const isSavingsInsufficient =
    method === 'savings' && (!activeMember || activeMember.savingsBalance < totalNet);

  // Quick cash buttons
  const quickCashOptions = [
    totalNet,
    Math.ceil(totalNet / 10000) * 10000,
    Math.ceil(totalNet / 20000) * 20000,
    50000,
    100000,
    200000,
  ].filter((val, idx, arr) => val >= totalNet && arr.indexOf(val) === idx);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'cash') {
      if (cashTendered < totalNet) {
        alert('Jumlah uang tunai yang diterima kurang dari total belanja.');
        return;
      }
      onConfirmPayment('cash', cashTendered, change, notes);
    } else if (method === 'qris') {
      onConfirmPayment('qris', totalNet, 0, notes || 'QRIS Pembayaran');
    } else if (method === 'savings') {
      if (isSavingsInsufficient) {
        alert('Saldo simpanan anggota tidak mencukupi.');
        return;
      }
      onConfirmPayment('savings', totalNet, 0, 'Potong Saldo Simpanan Kopma');
    } else if (method === 'transfer') {
      onConfirmPayment('transfer', totalNet, 0, notes || 'Transfer Bank Kampus');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Pembayaran Transaksi Kasir</h3>
            <p className="text-xs text-emerald-200">
              Total yang harus dibayar:{' '}
              <strong className="text-white text-sm font-mono">{formatRupiah(totalNet)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Payment Method Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-bold ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-bold ${
                  method === 'qris'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>QRIS Kopma</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('savings')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-bold ${
                  method === 'savings'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Saldo Kopma</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-bold ${
                  method === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* METHOD: CASH */}
          {method === 'cash' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uang Diterima dari Pembeli (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCashTendered(opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      cashTendered === opt
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {opt === totalNet ? 'Uang Pas' : formatRupiah(opt)}
                  </button>
                ))}
              </div>

              {/* Change Display */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <span className="text-xs font-bold">
                  {isCashInsufficient ? 'Uang Masih Kurang' : 'Uang Kembalian'}
                </span>
                <span className="font-mono text-lg font-extrabold">
                  {isCashInsufficient
                    ? `- ${formatRupiah(totalNet - cashTendered)}`
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {/* METHOD: QRIS */}
          {method === 'qris' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                <div className="text-[10px] font-extrabold text-slate-800 tracking-wider mb-1">
                  QRIS STANDAR PEMBAYARAN NASIONAL
                </div>
                {/* Dynamic QR Code Simulator */}
                <div className="relative w-48 h-48 bg-slate-950 p-2 rounded-lg flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded flex flex-col items-center justify-center p-2">
                    {/* SVG representation of standard QR Code */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-40 h-40 fill-slate-900"
                    >
                      <rect x="5" y="5" width="30" height="30" rx="2" fill="none" stroke="#10b981" strokeWidth="6" />
                      <rect x="13" y="13" width="14" height="14" fill="#047857" />
                      <rect x="65" y="5" width="30" height="30" rx="2" fill="none" stroke="#10b981" strokeWidth="6" />
                      <rect x="73" y="13" width="14" height="14" fill="#047857" />
                      <rect x="5" y="65" width="30" height="30" rx="2" fill="none" stroke="#10b981" strokeWidth="6" />
                      <rect x="13" y="73" width="14" height="14" fill="#047857" />
                      {/* Random QR Grid modules */}
                      <rect x="42" y="10" width="8" height="8" fill="#1e293b" />
                      <rect x="52" y="18" width="6" height="6" fill="#1e293b" />
                      <rect x="42" y="30" width="16" height="8" fill="#1e293b" />
                      <rect x="10" y="45" width="10" height="8" fill="#1e293b" />
                      <rect x="25" y="45" width="8" height="12" fill="#1e293b" />
                      <rect x="45" y="45" width="14" height="14" fill="#059669" />
                      <rect x="68" y="45" width="12" height="6" fill="#1e293b" />
                      <rect x="85" y="45" width="8" height="15" fill="#1e293b" />
                      <rect x="42" y="68" width="12" height="10" fill="#1e293b" />
                      <rect x="60" y="68" width="8" height="8" fill="#1e293b" />
                      <rect x="75" y="68" width="14" height="12" fill="#1e293b" />
                      <rect x="60" y="85" width="18" height="8" fill="#1e293b" />
                    </svg>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800 mt-2">{settings.qrisAccountName}</p>
                <p className="text-[10px] text-slate-500 font-mono">NMID: {settings.qrisNmid}</p>
                <p className="text-sm font-extrabold text-emerald-800 font-mono mt-1">
                  {formatRupiah(totalNet)}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Arahkan kamera aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay, Mobile Banking) pembeli ke kode QR di atas.
              </p>
            </div>
          )}

          {/* METHOD: SALDO SIMPANAN KOPMA */}
          {method === 'savings' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              {activeMember ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{activeMember.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{activeMember.nak}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Saldo Simpanan</p>
                      <p className="text-sm font-bold text-emerald-700 font-mono">
                        {formatRupiah(activeMember.savingsBalance)}
                      </p>
                    </div>
                  </div>

                  {isSavingsInsufficient ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Saldo simpanan tidak mencukupi (Kurang{' '}
                        {formatRupiah(totalNet - activeMember.savingsBalance)}). Silakan gunakan
                        metode Tunai atau QRIS.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between font-medium">
                      <span>Sisa Saldo Setelah Transaksi:</span>
                      <span className="font-mono font-bold">
                        {formatRupiah(activeMember.savingsBalance - totalNet)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center">
                  <p className="font-semibold">Belum Ada Anggota Terpilih</p>
                  <p className="mt-0.5">
                    Metode ini hanya bisa digunakan untuk Anggota Kopma yang memiliki saldo simpanan
                    sukarela.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* METHOD: TRANSFER BANK */}
          {method === 'transfer' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">Rekening Resmi Koperasi Mahasiswa:</p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono">
                <p><strong>Bank:</strong> Bank BNI Kampus</p>
                <p><strong>No. Rek:</strong> 0812-9988-1234-001</p>
                <p><strong>Atas Nama:</strong> KOPMA MANDIRI MAHASISWA</p>
              </div>
              <p className="text-slate-500 text-[11px]">
                Pastikan pembeli telah menunjukkan bukti transfer lunas sebelum mengonfirmasi pembayaran.
              </p>
            </div>
          )}

          {/* Optional Transaction Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Transaksi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pesanan titipan panitia wisuda"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCashInsufficient || (method === 'savings' && isSavingsInsufficient)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-1.5"
            >
              <span>Konfirmasi & Cetak Struk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
