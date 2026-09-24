import React, { useState, useMemo } from 'react';
import { X, Search, UserCheck, Plus, UserPlus, Phone, GraduationCap, Wallet } from 'lucide-react';
import { Member } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface MemberSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSelectMember: (member: Member) => void;
  onAddNewMember: (member: Member) => void;
}

export const MemberSelectModal: React.FC<MemberSelectModalProps> = ({
  isOpen,
  onClose,
  members,
  onSelectMember,
  onAddNewMember,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // New member form state
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    faculty: '',
    phone: '',
    email: '',
  });

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nak.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        m.faculty.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nim) {
      alert('Nama dan NIM wajib diisi.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const newNak = `KPM-${currentYear}-${randNum}`;

    const newMember: Member = {
      id: 'mbr-' + Date.now(),
      nak: newNak,
      name: formData.name.trim(),
      nim: formData.nim.trim(),
      faculty: formData.faculty.trim() || 'Umum',
      phone: formData.phone.trim() || '-',
      email: formData.email.trim() || undefined,
      joinDate: new Date().toISOString().split('T')[0],
      savingsBalance: 0,
      points: 0,
      totalSpent: 0,
      status: 'aktif',
    };

    onAddNewMember(newMember);
    onSelectMember(newMember);
    setIsRegistering(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">
              {isRegistering ? 'Daftar Anggota Baru Kopma' : 'Pilih Anggota Koperasi (KOPMA)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isRegistering ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari NAK, NIM, Nama Mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Register New Member prompt button */}
            <button
              onClick={() => setIsRegistering(true)}
              className="w-full py-2 px-3 border border-dashed border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Mahasiswa Baru Jadi Anggota Kopma</span>
            </button>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  <p>Tidak ada anggota yang cocok dengan pencarian.</p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      onSelectMember(member);
                      onClose();
                    }}
                    className="p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer transition flex items-center justify-between group shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-900">
                          {member.name}
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                          {member.nak}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <span className="flex items-center space-x-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.nim} &bull; {member.faculty}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-700 flex items-center space-x-3 pt-1">
                        <span className="flex items-center space-x-1">
                          <Wallet className="w-3 h-3" />
                          <span>Saldo: <strong>{formatRupiah(member.savingsBalance)}</strong></span>
                        </span>
                        <span>&bull;</span>
                        <span>Poin SHU: <strong>{member.points}</strong></span>
                      </div>
                    </div>

                    <button className="bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition shadow-xs">
                      Pilih
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Mahasiswa *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Rueda Aditiansyah"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIM (No Induk Mahasiswa) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="21051204018"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fakultas / Program Studi
                </label>
                <input
                  type="text"
                  placeholder="Teknik Informatika"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / HP
                </label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Kampus (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="mhs@student.ac.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-semibold">Keuntungan Anggota Kopma:</p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-700">
                <li>Harga khusus anggota di setiap transaksi.</li>
                <li>Akumulasi poin untuk pembagian Sisa Hasil Usaha (SHU) tahunan.</li>
                <li>Bisa menabung di Simpanan Sukarela Kopma.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Simpan & Pilih Anggota
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
