import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Check, Building, QrCode, ReceiptText } from 'lucide-react';
import { KopmaSettings } from '../../types';

interface StoreSettingsProps {
  settings: KopmaSettings;
  onSaveSettings: (settings: KopmaSettings) => void;
  onResetData: () => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<KopmaSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Pengaturan Koperasi & Toko</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Kustomisasi identitas Kopma, nama kasir, teks struk belanja, dan akun QRIS pembayaran.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Toko & Koperasi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Identitas Unit Usaha KOPMA</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Unit Toko / Minimarket *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Koperasi / Kampus *
              </label>
              <input
                type="text"
                required
                value={formData.universityName}
                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat / Lokasi Toko
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. Telepon / WhatsApp Kasir
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Akun QRIS & Pembayaran */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi QRIS Toko</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Akun QRIS (Merchant Name)
              </label>
              <input
                type="text"
                value={formData.qrisAccountName}
                onChange={(e) => setFormData({ ...formData, qrisAccountName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NMID QRIS
              </label>
              <input
                type="text"
                value={formData.qrisNmid}
                onChange={(e) => setFormData({ ...formData, qrisNmid: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Teks Struk Belanja */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ReceiptText className="w-4 h-4 text-emerald-600" />
            <span>Pesan Kaki Struk (Receipt Footer)</span>
          </h2>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan / Motto di Bagian Bawah Struk
            </label>
            <textarea
              rows={3}
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-emerald-500 text-xs"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Apakah Anda yakin ingin me-reset seluruh data kembali ke data contoh bawaan?'
                )
              ) {
                onResetData();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Data Bawaan</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
