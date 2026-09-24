import { Product, Member, KopmaSettings, Transaction, CashierShift } from '../types';

export const initialProducts: Product[] = [
  // Minuman
  {
    id: 'prod-001',
    barcode: '8992775211112',
    name: 'Air Mineral Kopma 600ml',
    category: 'minuman',
    costPrice: 2200,
    generalPrice: 3500,
    memberPrice: 3000,
    stock: 72,
    unit: 'botol',
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
    description: 'Air mineral kemasan botol segar higienis produksi Kopma.'
  },
  {
    id: 'prod-002',
    barcode: '8999999001234',
    name: 'Teh Botol Sosro Kotak 250ml',
    category: 'minuman',
    costPrice: 3000,
    generalPrice: 4500,
    memberPrice: 4000,
    stock: 35,
    unit: 'kotak',
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&auto=format&fit=crop&q=80',
    description: 'Minuman teh melati asli dalam kemasan tetra pak.'
  },
  {
    id: 'prod-003',
    barcode: '8992753112001',
    name: 'Ultra Milk Cokelat 250ml',
    category: 'minuman',
    costPrice: 5200,
    generalPrice: 7000,
    memberPrice: 6500,
    stock: 28,
    unit: 'kotak',
    minStockAlert: 8,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
    description: 'Susu UHT rasa coklat lezat kaya kalsium.'
  },
  {
    id: 'prod-004',
    barcode: '8993175538112',
    name: 'Kopi Good Day Cappuccino 30g',
    category: 'minuman',
    costPrice: 2000,
    generalPrice: 3000,
    memberPrice: 2500,
    stock: 45,
    unit: 'sachet',
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    description: 'Kopi instan cappuccino siap seduh dengan choco granule.'
  },
  {
    id: 'prod-005',
    barcode: '8996001414002',
    name: 'Pocari Sweat Botol 500ml',
    category: 'minuman',
    costPrice: 6800,
    generalPrice: 8500,
    memberPrice: 8000,
    stock: 18,
    unit: 'botol',
    minStockAlert: 6,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    description: 'Minuman isotonik pengganti ion tubuh setelah beraktivitas.'
  },

  // Makanan & Camilan
  {
    id: 'prod-006',
    barcode: '8998866200213',
    name: 'Indomie Goreng Spesial 85g',
    category: 'makanan',
    costPrice: 2700,
    generalPrice: 3800,
    memberPrice: 3500,
    stock: 120,
    unit: 'bungkus',
    minStockAlert: 24,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=80',
    description: 'Mie instan goreng favorit mahasiswa Indonesia.'
  },
  {
    id: 'prod-007',
    barcode: '8998866200220',
    name: 'Indomie Kuah Ayam Bawang 69g',
    category: 'makanan',
    costPrice: 2600,
    generalPrice: 3600,
    memberPrice: 3300,
    stock: 85,
    unit: 'bungkus',
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80',
    description: 'Mie kuah kaldu ayam gurih lezat beraroma bawang.'
  },
  {
    id: 'prod-008',
    barcode: '8991001110022',
    name: 'Beng-Beng Wafer Cokelat 25g',
    category: 'makanan',
    costPrice: 2100,
    generalPrice: 3000,
    memberPrice: 2500,
    stock: 64,
    unit: 'pcs',
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=300&auto=format&fit=crop&q=80',
    description: 'Wafer berlapis karamel, krispi, dan coklat 4 in 1.'
  },
  {
    id: 'prod-009',
    barcode: '8992761132014',
    name: 'Chitato Sapi Panggang 68g',
    category: 'makanan',
    costPrice: 9000,
    generalPrice: 11500,
    memberPrice: 10500,
    stock: 22,
    unit: 'bungkus',
    minStockAlert: 5,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    description: 'Keripik kentang bergelombang rasa daging sapi panggang gurih.'
  },
  {
    id: 'prod-010',
    barcode: '8992745330109',
    name: 'Roti Sari Roti Sandwich Cokelat',
    category: 'makanan',
    costPrice: 4800,
    generalPrice: 6000,
    memberPrice: 5500,
    stock: 14,
    unit: 'pcs',
    minStockAlert: 5,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    description: 'Roti tawar kupas lembut dengan isi pasta cokelat tebal.'
  },

  // ATK & Kuliah
  {
    id: 'prod-011',
    barcode: '8991389220011',
    name: 'Buku Tulis Sinar Dunia (SiDU) 38 Lembar',
    category: 'atk',
    costPrice: 3200,
    generalPrice: 4500,
    memberPrice: 4000,
    stock: 90,
    unit: 'buku',
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    description: 'Buku catatan bergaris kertas tebal putih untuk catatan kuliah.'
  },
  {
    id: 'prod-012',
    barcode: '8992345001019',
    name: 'Pulpen Standard AE7 0.5 Hitam',
    category: 'atk',
    costPrice: 2000,
    generalPrice: 3000,
    memberPrice: 2500,
    stock: 150,
    unit: 'pcs',
    minStockAlert: 30,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
    description: 'Pulpen tinta hitam legendaris, licin, dan tidak macet saat ujian.'
  },
  {
    id: 'prod-013',
    barcode: '8992345001026',
    name: 'Pensil 2B Faber Castell',
    category: 'atk',
    costPrice: 3800,
    generalPrice: 5500,
    memberPrice: 5000,
    stock: 45,
    unit: 'pcs',
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-77884d3b64c6?w=300&auto=format&fit=crop&q=80',
    description: 'Pensil standar ujian komputer (UAN / Ujian Kampus).'
  },
  {
    id: 'prod-014',
    barcode: '8991200330018',
    name: 'Kertas HVS A4 70gsm PaperOne (Rim)',
    category: 'atk',
    costPrice: 48000,
    generalPrice: 55000,
    memberPrice: 52000,
    stock: 12,
    unit: 'rim',
    minStockAlert: 4,
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&auto=format&fit=crop&q=80',
    description: '1 Rim (500 lembar) kertas HVS ukuran A4 untuk skripsi dan tugas.'
  },
  {
    id: 'prod-015',
    barcode: '8991200330099',
    name: 'Stopmap Folio Buffalo Kopma (Map Kertas)',
    category: 'atk',
    costPrice: 1200,
    generalPrice: 2500,
    memberPrice: 2000,
    stock: 65,
    unit: 'lembar',
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=300&auto=format&fit=crop&q=80',
    description: 'Map tebal buffalo untuk mengumpulkan laporan dan tugas.'
  },

  // Merchandise Kopma & Kampus
  {
    id: 'prod-016',
    barcode: '8999901000011',
    name: 'Lanyard Kopma Eksklusif + Holder Card',
    category: 'merchandise',
    costPrice: 14000,
    generalPrice: 22000,
    memberPrice: 18000,
    stock: 40,
    unit: 'pcs',
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    description: 'Tali id card eksklusif logo Kopma bahan tisue halus anti luntur.'
  },
  {
    id: 'prod-017',
    barcode: '8999901000028',
    name: 'Tumbler Stainless Kopma 500ml',
    category: 'merchandise',
    costPrice: 45000,
    generalPrice: 65000,
    memberPrice: 58000,
    stock: 15,
    unit: 'pcs',
    minStockAlert: 5,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop&q=80',
    description: 'Botol minum insulasi tahan panas dingin hingga 8 jam grafir Kopma.'
  },
  {
    id: 'prod-018',
    barcode: '8999901000035',
    name: 'Totebag Kanvas Kampus Eco Kopma',
    category: 'merchandise',
    costPrice: 25000,
    generalPrice: 38000,
    memberPrice: 32000,
    stock: 24,
    unit: 'pcs',
    minStockAlert: 5,
    imageUrl: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=300&auto=format&fit=crop&q=80',
    description: 'Tas jinjing kanvas tebal dengan ritsleting, ramah lingkungan.'
  },

  // Fotokopi & Jasa Cetak
  {
    id: 'prod-019',
    barcode: '8990001000101',
    name: 'Cetak Hitam Putih / Print B&W A4',
    category: 'fotokopi',
    costPrice: 150,
    generalPrice: 500,
    memberPrice: 350,
    stock: 9999,
    unit: 'lembar',
    minStockAlert: 500,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80',
    description: 'Jasa print laser hitam putih dokumen/makalah/tugas kuliah.'
  },
  {
    id: 'prod-020',
    barcode: '8990001000102',
    name: 'Cetak Warna Full / Print Color A4',
    category: 'fotokopi',
    costPrice: 500,
    generalPrice: 1500,
    memberPrice: 1200,
    stock: 9999,
    unit: 'lembar',
    minStockAlert: 500,
    imageUrl: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=300&auto=format&fit=crop&q=80',
    description: 'Jasa print laser warna tajam untuk presentasi dan proposal.'
  },
  {
    id: 'prod-021',
    barcode: '8990001000103',
    name: 'Jasa Jilid Lakban Biasa + Mika',
    category: 'fotokopi',
    costPrice: 1500,
    generalPrice: 4000,
    memberPrice: 3000,
    stock: 500,
    unit: 'buku',
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    description: 'Jilid tugas kuliah lengkap dengan mika bening depan dan buffalo belakang.'
  }
];

export const initialMembers: Member[] = [
  {
    id: 'mbr-001',
    nak: 'KPM-2023-0142',
    name: 'Rueda Aditiansyah Pratama',
    nim: '21051204018',
    faculty: 'Teknik Informatika',
    phone: '081234567890',
    email: 'ruedaaditiansyahprtama@gmail.com',
    joinDate: '2023-09-15',
    savingsBalance: 125000,
    points: 48,
    totalSpent: 480000,
    status: 'aktif'
  },
  {
    id: 'mbr-002',
    nak: 'KPM-2023-0089',
    name: 'Nabila Putri Cahyani',
    nim: '21081020104',
    faculty: 'Ekonomi & Bisnis',
    phone: '085712345678',
    email: 'nabila.pc@student.ac.id',
    joinDate: '2023-08-20',
    savingsBalance: 50000,
    points: 32,
    totalSpent: 320000,
    status: 'aktif'
  },
  {
    id: 'mbr-003',
    nak: 'KPM-2024-0015',
    name: 'Fajar Nugroho',
    nim: '22030214033',
    faculty: 'MIPA (Matematika)',
    phone: '087890123456',
    email: 'fajar.nugroho@student.ac.id',
    joinDate: '2024-02-10',
    savingsBalance: 85000,
    points: 65,
    totalSpent: 650000,
    status: 'aktif'
  },
  {
    id: 'mbr-004',
    nak: 'KPM-2024-0210',
    name: 'Dinda Ayu Lestari',
    nim: '23020114002',
    faculty: 'Ilmu Sosial & Ilmu Politik',
    phone: '089678123450',
    email: 'dinda.ayu@student.ac.id',
    joinDate: '2024-09-01',
    savingsBalance: 20000,
    points: 15,
    totalSpent: 150000,
    status: 'aktif'
  }
];

export const initialSettings: KopmaSettings = {
  storeName: 'KOPMA Mart & Stationery',
  subTitle: 'Koperasi Mahasiswa Universitas',
  universityName: 'Universitas Kampus Perjuangan',
  address: 'Gedung Student Center Lt. 1, Kampus Utama',
  phone: '0812-3456-7890 / Ext. 102',
  cashierName: 'Aditiansyah (Kasir 1)',
  receiptFooter: 'Terima kasih telah berbelanja di KOPMA!\nMari dukung kemandirian ekonomi mahasiswa bersama Koperasi Mahasiswa.',
  enableMemberDiscount: true,
  qrisAccountName: 'KOPMA UNIVERSITAS - QRIS RESMI',
  qrisNmid: 'ID102024891234'
};

export const initialShift: CashierShift = {
  id: 'shift-' + Date.now(),
  cashierName: 'Aditiansyah (Kasir 1)',
  startTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  openingCash: 200000, // Modal awal laci kasir Rp 200.000
  cashSales: 165000,
  nonCashSales: 215000,
  expectedCash: 365000,
  status: 'open'
};

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-001',
    invoiceNumber: 'KPM-240923-1082',
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    items: [
      {
        product: initialProducts[0],
        quantity: 2,
        unitPrice: 3000,
        customDiscount: 0,
        subtotal: 6000
      },
      {
        product: initialProducts[5],
        quantity: 3,
        unitPrice: 3500,
        customDiscount: 0,
        subtotal: 10500
      }
    ],
    subtotal: 18400,
    totalDiscount: 1900,
    memberDiscountSavings: 1900,
    totalNet: 16500,
    paymentMethod: 'cash',
    cashTendered: 20000,
    change: 3500,
    memberId: 'mbr-001',
    memberName: 'Rueda Aditiansyah Pratama',
    memberNak: 'KPM-2023-0142',
    cashierName: 'Aditiansyah (Kasir 1)',
    status: 'completed'
  },
  {
    id: 'tx-002',
    invoiceNumber: 'KPM-240923-2144',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    items: [
      {
        product: initialProducts[13], // Kertas HVS
        quantity: 1,
        unitPrice: 52000,
        customDiscount: 0,
        subtotal: 52000
      },
      {
        product: initialProducts[11], // Pulpen
        quantity: 5,
        unitPrice: 2500,
        customDiscount: 0,
        subtotal: 12500
      }
    ],
    subtotal: 70000,
    totalDiscount: 5500,
    memberDiscountSavings: 5500,
    totalNet: 64500,
    paymentMethod: 'qris',
    memberId: 'mbr-003',
    memberName: 'Fajar Nugroho',
    memberNak: 'KPM-2024-0015',
    cashierName: 'Aditiansyah (Kasir 1)',
    status: 'completed'
  },
  {
    id: 'tx-003',
    invoiceNumber: 'KPM-240923-3391',
    date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    items: [
      {
        product: initialProducts[15], // Lanyard Kopma
        quantity: 1,
        unitPrice: 22000, // Harga umum (non member)
        customDiscount: 0,
        subtotal: 22000
      },
      {
        product: initialProducts[1], // Teh Botol
        quantity: 2,
        unitPrice: 4500,
        customDiscount: 0,
        subtotal: 9000
      }
    ],
    subtotal: 31000,
    totalDiscount: 0,
    memberDiscountSavings: 0,
    totalNet: 31000,
    paymentMethod: 'qris',
    cashierName: 'Aditiansyah (Kasir 1)',
    status: 'completed'
  }
];
