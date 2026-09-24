import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, UserCheck, UserPlus, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { CartItem, Member } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface CartDrawerProps {
  cart: CartItem[];
  activeMember: Member | null;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenMemberModal: () => void;
  onDetachMember: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  activeMember,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenMemberModal,
  onDetachMember,
  onCheckout
}) => {
  // Calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal without member discount
  const grossSubtotal = cart.reduce(
    (sum, item) => sum + item.product.generalPrice * item.quantity,
    0
  );

  // Net subtotal based on effective unitPrice
  const netTotal = cart.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  // Total savings from member pricing
  const totalSavings = Math.max(0, grossSubtotal - netTotal);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full select-none">
      {/* Member Banner / Selector Header */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200">
        {activeMember ? (
          <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-3 relative shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-bold text-emerald-950 line-clamp-1">
                      {activeMember.name}
                    </h4>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-800 font-mono px-1.5 py-0.2 rounded font-semibold">
                      {activeMember.nak}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {activeMember.faculty} &bull; Saldo: <strong>{formatRupiah(activeMember.savingsBalance)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={onDetachMember}
                className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-medium"
                title="Batalkan Anggota"
              >
                Ganti
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Harga Khusus Anggota Aktif</span>
              </span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                +1 Poin SHU/Rp10rb
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenMemberModal}
            className="w-full bg-white hover:bg-slate-50 border border-dashed border-emerald-500 text-emerald-800 rounded-xl p-2.5 flex items-center justify-between transition group shadow-xs"
          >
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                  Pilih Anggota Kopma
                </p>
                <p className="text-[10px] text-slate-500">
                  Dapatkan diskon anggota & tambah poin SHU
                </p>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-semibold group-hover:bg-emerald-200">
              Pilih
            </span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            </div>
            <p className="font-semibold text-slate-600 text-sm">Keranjang masih kosong</p>
            <p className="text-xs text-slate-400 text-center max-w-[220px]">
              Klik produk di katalog atau scan barcode untuk menambahkan barang.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const hasMemberDiscount = activeMember && item.product.memberPrice < item.product.generalPrice;
            return (
              <div
                key={item.product.id}
                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between transition shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono">{formatRupiah(item.unitPrice)}</span>
                      {hasMemberDiscount && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                          Anggota
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stepper and Subtotal */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        onUpdateQuantity(item.product.id, val);
                      }}
                      className="w-11 h-7 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono focus:outline-emerald-500"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-2xs active:scale-95 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {item.quantity >= item.product.stock && (
                      <span className="text-[10px] text-amber-600 font-medium ml-1">
                        Maks
                      </span>
                    )}
                  </div>

                  <div className="text-right font-mono font-bold text-slate-900 text-sm">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        {/* Quick clear cart */}
        {cart.length > 0 && (
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 text-slate-500">
            <span>{totalItemsCount} item di keranjang</span>
            <button
              onClick={onClearCart}
              className="text-rose-600 hover:text-rose-800 font-semibold hover:underline flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          </div>
        )}

        {/* Pricing breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono">{formatRupiah(grossSubtotal)}</span>
          </div>

          {totalSavings > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Diskon Anggota Kopma</span>
              </span>
              <span className="font-mono">-{formatRupiah(totalSavings)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Total Bayar</span>
            <span className="text-xl font-extrabold font-mono text-emerald-800">
              {formatRupiah(netTotal)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm tracking-wide active:scale-[0.99]"
        >
          <CreditCard className="w-4.5 h-4.5" />
          <span>PROSES PEMBAYARAN</span>
        </button>
      </div>
    </div>
  );
};
