import React, { useState, useRef, useMemo } from 'react';
import { Search, Barcode, Plus, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { Product, ProductCategory, Member } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ProductGridProps {
  products: Product[];
  activeMember: Member | null;
  onAddToCart: (product: Product) => void;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'semua', label: 'Semua Produk' },
  { id: 'makanan', label: '🍜 Makanan & Camilan' },
  { id: 'minuman', label: '🥤 Minuman Dingin' },
  { id: 'atk', label: '✏️ ATK & Kuliah' },
  { id: 'merchandise', label: '🎓 Merchandise Kopma' },
  { id: 'fotokopi', label: '🖨️ Fotokopi & Cetak' },
];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  activeMember,
  onAddToCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [quickScanSuccess, setQuickScanSuccess] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = selectedCategory === 'semua' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.barcode.includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode scanner or rapid entry
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim()
    );

    if (matched) {
      if (matched.stock <= 0) {
        alert(`Stok produk "${matched.name}" sedang habis!`);
      } else {
        onAddToCart(matched);
        setQuickScanSuccess(matched.name);
        setTimeout(() => setQuickScanSuccess(null), 2000);
      }
      setBarcodeInput('');
    } else {
      alert(`Produk dengan barcode "${barcodeInput}" tidak ditemukan dalam katalog.`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Search and Barcode Scanner Bar */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Text Search */}
          <div className="relative sm:col-span-7">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang / ketik kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                &times;
              </button>
            )}
          </div>

          {/* Barcode Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative sm:col-span-5">
            <Barcode className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode + Enter"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-14 py-2.5 bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white border border-emerald-300/70 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-emerald-950 placeholder-emerald-600/60 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-lg font-medium transition"
            >
              Scan
            </button>
          </form>
        </div>

        {/* Quick Flash Success Banner */}
        {quickScanSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Berhasil menambahkan <strong>{quickScanSuccess}</strong> ke keranjang!
            </span>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List / Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-2">
            <Layers className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-400">
              Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
              const effectivePrice = activeMember ? product.memberPrice : product.generalPrice;
              const hasMemberDiscount = product.memberPrice < product.generalPrice;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                  className={`group relative flex flex-col justify-between bg-white rounded-2xl p-3 border transition-all duration-200 select-none ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  {/* Image / Thumbnail */}
                  <div className="relative w-full h-28 bg-slate-100 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // fallback if image fails
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-0.5 shadow-xs">
                          <AlertTriangle className="w-3 h-3 inline" />
                          <span>Sisa {product.stock}</span>
                        </span>
                      ) : (
                        <span className="bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                          Stok: {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Member Savings Badge if active */}
                    {activeMember && hasMemberDiscount && (
                      <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center space-x-1">
                        <span>Hemat {formatRupiah(product.generalPrice - product.memberPrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & SKU */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {product.barcode} &bull; /{product.unit}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        {activeMember ? (
                          <div>
                            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
                              Harga Anggota
                            </span>
                            <div className="flex items-baseline space-x-1.5">
                              <span className="font-extrabold text-sm sm:text-base text-emerald-800 font-mono">
                                {formatRupiah(effectivePrice)}
                              </span>
                              <span className="text-[10px] line-through text-slate-400">
                                {formatRupiah(product.generalPrice)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Harga Umum
                            </span>
                            <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono">
                              {formatRupiah(product.generalPrice)}
                            </span>
                            {hasMemberDiscount && (
                              <span className="block text-[10px] text-emerald-600 font-medium">
                                Anggota: {formatRupiah(product.memberPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Add Button */}
                      {!isOutOfStock && (
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition shadow-xs"
                          title="Tambah ke Keranjang"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
