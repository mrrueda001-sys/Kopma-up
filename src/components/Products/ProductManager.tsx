import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  X,
  Layers,
  ArrowUpRight,
  Barcode
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface ProductManagerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Form inputs
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    category: 'makanan',
    costPrice: 0,
    generalPrice: 0,
    memberPrice: 0,
    stock: 10,
    unit: 'pcs',
    minStockAlert: 5,
    imageUrl: '',
    description: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = filterCategory === 'semua' || p.category === filterCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q);

      let matchStock = true;
      if (filterStock === 'low') {
        matchStock = p.stock > 0 && p.stock <= p.minStockAlert;
      } else if (filterStock === 'out') {
        matchStock = p.stock <= 0;
      }

      return matchCat && matchSearch && matchStock;
    });
  }, [products, search, filterCategory, filterStock]);

  const openAddModal = () => {
    const randomBarcode = '899' + Math.floor(1000000000 + Math.random() * 9000000000);
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: randomBarcode,
      category: 'makanan',
      costPrice: 2000,
      generalPrice: 3000,
      memberPrice: 2500,
      stock: 20,
      unit: 'pcs',
      minStockAlert: 5,
      imageUrl: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      alert('Nama produk dan barcode wajib diisi!');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...(formData as Product),
      });
    } else {
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        barcode: formData.barcode!,
        name: formData.name!,
        category: (formData.category as ProductCategory) || 'lainnya',
        costPrice: Number(formData.costPrice) || 0,
        generalPrice: Number(formData.generalPrice) || 0,
        memberPrice: Number(formData.memberPrice) || 0,
        stock: Number(formData.stock) || 0,
        unit: formData.unit || 'pcs',
        minStockAlert: Number(formData.minStockAlert) || 5,
        imageUrl: formData.imageUrl || undefined,
        description: formData.description || undefined,
      };
      onAddProduct(newProduct);
    }
    setIsFormOpen(false);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingProduct) return;
    if (restockQty <= 0) return;

    onUpdateProduct({
      ...restockingProduct,
      stock: restockingProduct.stock + restockQty,
    });
    setRestockingProduct(null);
  };

  // Quick stats
  const totalItems = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const totalStockValuation = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Katalog & Manajemen Stok</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola inventaris, harga umum, harga khusus anggota Kopma, dan batas stok menipis.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Produk</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalItems}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Nilai Modal Stok</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatRupiah(totalStockValuation)}
          </p>
        </div>
        <div
          onClick={() => setFilterStock(filterStock === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            filterStock === 'low'
              ? 'bg-amber-100 border-amber-400'
              : 'bg-white hover:bg-amber-50/50 border-slate-200'
          }`}
        >
          <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stok Menipis</span>
          </span>
          <p className="text-2xl font-bold font-mono text-amber-800 mt-1">{lowStockCount}</p>
        </div>
        <div
          onClick={() => setFilterStock(filterStock === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-2xs ${
            filterStock === 'out'
              ? 'bg-rose-100 border-rose-400'
              : 'bg-white hover:bg-rose-50/50 border-slate-200'
          }`}
        >
          <span className="text-xs text-rose-700 font-medium flex items-center space-x-1">
            <X className="w-3.5 h-3.5" />
            <span>Stok Habis</span>
          </span>
          <p className="text-2xl font-bold font-mono text-rose-800 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="semua">Semua Kategori</option>
            <option value="makanan">Makanan & Camilan</option>
            <option value="minuman">Minuman</option>
            <option value="atk">ATK & Kuliah</option>
            <option value="merchandise">Merchandise Kopma</option>
            <option value="fotokopi">Fotokopi & Cetak</option>
          </select>

          {/* Stock Filter Pills */}
          <button
            onClick={() => setFilterStock('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStock === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Stok
          </button>
          <button
            onClick={() => setFilterStock('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStock === 'low'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Menipis ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterStock('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStock === 'out'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Habis ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Produk & Barcode</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga Modal</th>
                <th className="px-4 py-3">Harga Anggota</th>
                <th className="px-4 py-3">Harga Umum</th>
                <th className="px-4 py-3">Margin/Laba</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada produk yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minStockAlert;
                  const profitGeneral = p.generalPrice - p.costPrice;
                  const profitMember = p.memberPrice - p.costPrice;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.barcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {formatRupiah(p.costPrice)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                        {formatRupiah(p.memberPrice)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-900 font-bold">
                        {formatRupiah(p.generalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[10px] space-y-0.5">
                          <p className="text-emerald-700 font-medium">
                            Umum: +{formatRupiah(profitGeneral)}
                          </p>
                          <p className="text-slate-500">
                            Anggota: +{formatRupiah(profitMember)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                          {isLowStock && (
                            <span className="text-[9px] text-amber-600 font-semibold mt-0.5">
                              Menipis (&lt;{p.minStockAlert})
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="text-[9px] text-rose-600 font-semibold mt-0.5">
                              Habis
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Quick Restock button */}
                          <button
                            onClick={() => {
                              setRestockingProduct(p);
                              setRestockQty(10);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                            title="Tambah Stok"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus produk "${p.name}" dari katalog?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProduct ? 'Edit Produk Kopma' : 'Tambah Produk Baru ke Katalog'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Air Mineral Kopma 600ml"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                  >
                    <option value="makanan">Makanan & Camilan</option>
                    <option value="minuman">Minuman</option>
                    <option value="atk">ATK & Kuliah</option>
                    <option value="merchandise">Merchandise Kopma</option>
                    <option value="fotokopi">Fotokopi & Cetak</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Harga Modal
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    Harga Anggota
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.memberPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, memberPrice: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-emerald-400 bg-white rounded-lg text-xs font-mono font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Harga Umum
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.generalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, generalPrice: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, botol, pack"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Batas Peringatan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) =>
                      setFormData({ ...formData, minStockAlert: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Foto Produk (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Tambah Stok Barang (Restock)</h4>
              <button
                onClick={() => setRestockingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">{restockingProduct.name}</p>
              <p className="text-slate-500">
                Stok saat ini:{' '}
                <strong className="font-mono text-emerald-800">
                  {restockingProduct.stock} {restockingProduct.unit}
                </strong>
              </p>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Tambahan Stok
                </label>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-lg font-mono font-bold text-center focus:outline-emerald-500"
                />
              </div>

              {/* Quick buttons */}
              <div className="flex items-center justify-center space-x-2">
                {[5, 10, 24, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setRestockQty(qty)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    +{qty}
                  </button>
                ))}
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex justify-between">
                <span>Total Stok Setelah Restock:</span>
                <span className="font-bold font-mono">
                  {restockingProduct.stock + restockQty} {restockingProduct.unit}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockingProduct(null)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Konfirmasi Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
