import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  Award,
  PlusCircle,
  MinusCircle,
  GraduationCap,
  Calendar,
  X,
  Sparkles,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Member } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface MemberManagerProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  onAddMember,
  onUpdateMember,
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberForSavings, setSelectedMemberForSavings] = useState<Member | null>(null);
  const [savingsAction, setSavingsAction] = useState<'topup' | 'withdraw'>('topup');
  const [savingsAmount, setSavingsAmount] = useState<number>(50000);

  // Form for new member
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    nim: '',
    faculty: 'Teknik Informatika',
    phone: '',
    email: '',
    initialSavings: 50000,
  });

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nak.toLowerCase().includes(q) ||
        m.nim.toLowerCase().includes(q) ||
        m.faculty.toLowerCase().includes(q)
    );
  }, [members, search]);

  // Aggregate stats
  const totalMembers = members.length;
  const totalSavings = members.reduce((sum, m) => sum + m.savingsBalance, 0);
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const totalSpentByMembers = members.reduce((sum, m) => sum + m.totalSpent, 0);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.name || !newMemberData.nim) {
      alert('Nama dan NIM wajib diisi!');
      return;
    }

    const currentYear = new Date().getFullYear();
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const newNak = `KPM-${currentYear}-${randNum}`;

    const member: Member = {
      id: 'mbr-' + Date.now(),
      nak: newNak,
      name: newMemberData.name.trim(),
      nim: newMemberData.nim.trim(),
      faculty: newMemberData.faculty.trim() || 'Umum',
      phone: newMemberData.phone.trim() || '-',
      email: newMemberData.email.trim() || undefined,
      joinDate: new Date().toISOString().split('T')[0],
      savingsBalance: Number(newMemberData.initialSavings) || 0,
      points: 0,
      totalSpent: 0,
      status: 'aktif',
    };

    onAddMember(member);
    setIsAddModalOpen(false);
    setNewMemberData({
      name: '',
      nim: '',
      faculty: 'Teknik Informatika',
      phone: '',
      email: '',
      initialSavings: 50000,
    });
  };

  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForSavings) return;
    if (savingsAmount <= 0) return;

    if (savingsAction === 'withdraw' && savingsAmount > selectedMemberForSavings.savingsBalance) {
      alert('Jumlah penarikan melebihi saldo simpanan anggota!');
      return;
    }

    const updatedBalance =
      savingsAction === 'topup'
        ? selectedMemberForSavings.savingsBalance + savingsAmount
        : selectedMemberForSavings.savingsBalance - savingsAmount;

    onUpdateMember({
      ...selectedMemberForSavings,
      savingsBalance: updatedBalance,
    });

    setSelectedMemberForSavings(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Anggota KOPMA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Database keanggotaan mahasiswa, simpanan sukarela, dan akumulasi poin SHU (Sisa Hasil Usaha).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Daftar Anggota Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Anggota Aktif</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalMembers} Mahasiswa</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Simpanan Anggota</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatRupiah(totalSavings)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Belanja Anggota</span>
          <p className="text-2xl font-bold font-mono text-indigo-700 mt-1">
            {formatRupiah(totalSpentByMembers)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Akumulasi Poin SHU</span>
          </span>
          <p className="text-2xl font-bold font-mono text-amber-800 mt-1">{totalPoints} Poin</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NAK, NIM, atau fakultas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-500"
          />
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Tidak ada anggota yang cocok dengan kata kunci pencarian.
          </div>
        ) : (
          filteredMembers.map((member) => {
            // Estimated SHU: e.g. Rp 1.500 per point as cooperative profit share example
            const estimatedSHU = member.points * 1500;

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-800 font-bold mt-0.5">
                        {member.nak}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {member.status}
                    </span>
                  </div>

                  {/* Campus details */}
                  <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.nim} &bull; {member.faculty}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Bergabung: {formatDateIndo(member.joinDate)}</span>
                    </div>
                  </div>

                  {/* Financial & SHU metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Saldo Simpanan</span>
                      <span className="font-mono font-bold text-emerald-800 text-sm">
                        {formatRupiah(member.savingsBalance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Akumulasi Belanja</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {formatRupiah(member.totalSpent)}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-medium flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Poin Transaksi: <strong>{member.points}</strong></span>
                      </span>
                      <span className="text-slate-500">
                        Est. SHU: <strong className="text-emerald-700">{formatRupiah(estimatedSHU)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action: Manage Savings */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedMemberForSavings(member);
                      setSavingsAction('topup');
                      setSavingsAmount(50000);
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition mr-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Setor Simpanan</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMemberForSavings(member);
                      setSavingsAction('withdraw');
                      setSavingsAmount(member.savingsBalance);
                    }}
                    disabled={member.savingsBalance <= 0}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Tarik</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Pendaftaran Anggota KOPMA Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Mahasiswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rueda Aditiansyah"
                  value={newMemberData.name}
                  onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIM (Nomor Induk Mahasiswa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="21051204018"
                    value={newMemberData.nim}
                    onChange={(e) => setNewMemberData({ ...newMemberData, nim: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fakultas / Jurusan
                  </label>
                  <input
                    type="text"
                    placeholder="Teknik Informatika"
                    value={newMemberData.faculty}
                    onChange={(e) =>
                      setNewMemberData({ ...newMemberData, faculty: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={newMemberData.phone}
                    onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setoran Awal Simpanan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newMemberData.initialSavings}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        initialSavings: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                <p className="font-bold">Ketentuan Anggota Kopma:</p>
                <p>
                  Nomor Anggota Koperasi (NAK) akan digenerate otomatis. Anggota baru langsung berhak
                  atas harga khusus dan akumulasi poin SHU.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setor / Tarik Simpanan Modal */}
      {selectedMemberForSavings && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">
                {savingsAction === 'topup' ? 'Setor Simpanan Sukarela' : 'Tarik Simpanan Sukarela'}
              </h4>
              <button
                onClick={() => setSelectedMemberForSavings(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{selectedMemberForSavings.name}</p>
              <p className="text-slate-500 font-mono">NAK: {selectedMemberForSavings.nak}</p>
              <p className="text-slate-700">
                Saldo saat ini:{' '}
                <strong className="font-mono text-emerald-800">
                  {formatRupiah(selectedMemberForSavings.savingsBalance)}
                </strong>
              </p>
            </div>

            {/* Selector action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSavingsAction('topup')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  savingsAction === 'topup'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Setor (Top Up)
              </button>
              <button
                type="button"
                onClick={() => setSavingsAction('withdraw')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  savingsAction === 'withdraw'
                    ? 'bg-rose-700 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Tarik Simpanan
              </button>
            </div>

            <form onSubmit={handleSavingsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-mono font-bold text-center focus:outline-emerald-500"
                />
              </div>

              {/* Quick nominal buttons */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[20000, 50000, 100000, 200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSavingsAmount(val)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    {formatRupiah(val)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMemberForSavings(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Konfirmasi {savingsAction === 'topup' ? 'Setoran' : 'Penarikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
