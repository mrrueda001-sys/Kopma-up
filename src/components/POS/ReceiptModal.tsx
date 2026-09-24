import React, { useState } from 'react';
import { Check, Printer, Copy, RefreshCw, X, ArrowRight } from 'lucide-react';
import { Transaction, KopmaSettings } from '../../types';
import { formatRupiah, formatDateTimeIndo } from '../../utils/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  settings: KopmaSettings;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings,
  onNewTransaction,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `================================`,
      `       ${settings.storeName.toUpperCase()}`,
      `   ${settings.universityName}`,
      `   ${settings.address}`,
      `   Telp: ${settings.phone}`,
      `================================`,
      `No. Nota : ${transaction.invoiceNumber}`,
      `Waktu    : ${formatDateTimeIndo(transaction.date)}`,
      `Kasir    : ${transaction.cashierName}`,
      transaction.memberName
        ? `Anggota  : ${transaction.memberName} (${transaction.memberNak})`
        : `Pelanggan: Umum (Non-Anggota)`,
      `--------------------------------`,
      ...transaction.items.map(
        (item) =>
          `${item.product.name}\n  ${item.quantity} x ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`
      ),
      `--------------------------------`,
      `Subtotal        : ${formatRupiah(transaction.subtotal)}`,
      transaction.memberDiscountSavings > 0
        ? `Diskon Anggota  : -${formatRupiah(transaction.memberDiscountSavings)}`
        : null,
      `TOTAL           : ${formatRupiah(transaction.totalNet)}`,
      `Metode Bayar    : ${transaction.paymentMethod.toUpperCase()}`,
      transaction.cashTendered
        ? `Bayar Tunai     : ${formatRupiah(transaction.cashTendered)}`
        : null,
      transaction.change !== undefined
        ? `Kembalian       : ${formatRupiah(transaction.change)}`
        : null,
      `================================`,
      `${settings.receiptFooter}`,
      `================================`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-3.5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-sm">Pembayaran Berhasil!</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Struk Content (Paper Receipt Style) */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt"
            className="w-full max-w-[320px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 font-mono text-[11px] text-slate-900 leading-tight space-y-2 select-text"
          >
            {/* Header toko */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2.5">
              <h2 className="font-extrabold text-xs uppercase tracking-tight text-slate-900">
                {settings.storeName}
              </h2>
              <p className="text-[10px] text-slate-600">{settings.universityName}</p>
              <p className="text-[9px] text-slate-500">{settings.address}</p>
              <p className="text-[9px] text-slate-500">Telp: {settings.phone}</p>
            </div>

            {/* Meta Nota */}
            <div className="space-y-0.5 py-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTimeIndo(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-right">
                  {transaction.memberName
                    ? `${transaction.memberName} (Anggota)`
                    : 'Umum'}
                </span>
              </div>
              {transaction.memberNak && (
                <div className="flex justify-between text-emerald-800">
                  <span className="text-slate-500">NAK:</span>
                  <span className="font-bold">{transaction.memberNak}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300 pb-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold">{item.product.name}</div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.unitPrice)}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 py-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>

              {transaction.memberDiscountSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Anggota:</span>
                  <span>-{formatRupiah(transaction.memberDiscountSavings)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                <span>TOTAL AKHIR:</span>
                <span className="text-sm font-extrabold">{formatRupiah(transaction.totalNet)}</span>
              </div>

              <div className="flex justify-between text-slate-600 text-[10px] pt-1">
                <span>Metode Pembayaran:</span>
                <span className="font-bold uppercase">{transaction.paymentMethod}</span>
              </div>

              {transaction.cashTendered !== undefined && (
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Tunai Diterima:</span>
                  <span>{formatRupiah(transaction.cashTendered)}</span>
                </div>
              )}

              {transaction.change !== undefined && (
                <div className="flex justify-between font-bold text-[11px] text-slate-900">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(transaction.change)}</span>
                </div>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[9px] text-slate-500 whitespace-pre-line leading-normal">
              {settings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-white border-t border-slate-200 grid grid-cols-3 gap-2">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak</span>
          </button>

          <button
            onClick={handleCopyText}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Salin</span>
              </>
            )}
          </button>

          <button
            onClick={onNewTransaction}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
