export type ProductCategory = 
  | 'semua'
  | 'makanan'
  | 'minuman'
  | 'atk'
  | 'merchandise'
  | 'fotokopi'
  | 'lainnya';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  costPrice: number;       // Harga Modal / Beli
  generalPrice: number;    // Harga Jual Umum (Non-Anggota)
  memberPrice: number;     // Harga Khusus Anggota Kopma
  stock: number;
  unit: string;            // 'pcs', 'pack', 'botol', 'lembar', dll
  minStockAlert: number;   // Batas peringatan stok menipis
  imageUrl?: string;
  description?: string;
}

export interface Member {
  id: string;
  nak: string;             // Nomor Anggota Koperasi (e.g., KOPMA-2024-001)
  name: string;
  nim: string;             // Nomor Induk Mahasiswa
  faculty: string;         // Fakultas / Jurusan
  phone: string;
  email?: string;
  joinDate: string;
  savingsBalance: number;  // Saldo Simpanan Sukarela Anggota
  points: number;          // Poin Transaksi (untuk pembagian SHU)
  totalSpent: number;      // Akumulasi belanja di Kopma
  status: 'aktif' | 'non-aktif';
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;       // Effective price (member or general)
  customDiscount: number;  // Additional item discount in Rupiah
  subtotal: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'savings';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  memberDiscountSavings: number; // Berapa hemat karena jadi anggota
  totalNet: number;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  change?: number;
  memberId?: string;
  memberName?: string;
  memberNak?: string;
  cashierName: string;
  status: 'completed' | 'void';
  notes?: string;
}

export interface CashierShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  cashSales: number;
  nonCashSales: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'closed';
}

export interface KopmaSettings {
  storeName: string;
  subTitle: string;
  universityName: string;
  address: string;
  phone: string;
  cashierName: string;
  receiptFooter: string;
  enableMemberDiscount: boolean;
  qrisAccountName: string;
  qrisNmid: string;
}
