import React, { useState, useEffect } from 'react';
import {
  Product,
  Member,
  CartItem,
  Transaction,
  CashierShift,
  KopmaSettings,
  PaymentMethod,
} from './types';
import {
  loadProducts,
  saveProducts,
  loadMembers,
  saveMembers,
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  loadShift,
  saveShift,
  resetAllToDefaults,
} from './utils/storage';
import { generateInvoiceNumber } from './utils/formatters';

import { Navbar } from './components/Navbar';
import { ProductGrid } from './components/POS/ProductGrid';
import { CartDrawer } from './components/POS/CartDrawer';
import { MemberSelectModal } from './components/POS/MemberSelectModal';
import { PaymentModal } from './components/POS/PaymentModal';
import { ReceiptModal } from './components/POS/ReceiptModal';
import { ProductManager } from './components/Products/ProductManager';
import { MemberManager } from './components/Members/MemberManager';
import { ReportsDashboard } from './components/Reports/ReportsDashboard';
import { ShiftModal } from './components/Shift/ShiftModal';
import { StoreSettings } from './components/Settings/StoreSettings';

export const App: React.FC = () => {
  // App state
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'members' | 'reports' | 'settings'>('pos');
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [members, setMembers] = useState<Member[]>(loadMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [settings, setSettings] = useState<KopmaSettings>(loadSettings);
  const [currentShift, setCurrentShift] = useState<CashierShift>(loadShift);

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Persist whenever state changes
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveShift(currentShift);
  }, [currentShift]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('products');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('members');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('reports');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate cart item prices when activeMember changes
  useEffect(() => {
    if (cart.length === 0) return;
    setCart((prevCart) =>
      prevCart.map((item) => {
        const unitPrice = activeMember ? item.product.memberPrice : item.product.generalPrice;
        return {
          ...item,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      })
    );
  }, [activeMember]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      const unitPrice = activeMember ? product.memberPrice : product.generalPrice;

      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        const newQty = Math.min(product.stock, item.quantity + 1);
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: unitPrice * newQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            unitPrice,
            customDiscount: 0,
            subtotal: unitPrice,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(item.product.stock, newQty);
          return {
            ...item,
            quantity: clampedQty,
            subtotal: item.unitPrice * clampedQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart Calculations
  const grossSubtotal = cart.reduce(
    (sum, item) => sum + item.product.generalPrice * item.quantity,
    0
  );
  const netTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const memberSavings = Math.max(0, grossSubtotal - netTotal);

  // Payment Confirmation handler
  const handleConfirmPayment = (
    method: PaymentMethod,
    cashTendered?: number,
    change?: number,
    notes?: string
  ) => {
    const invoiceNumber = generateInvoiceNumber();
    const nowIso = new Date().toISOString();

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber,
      date: nowIso,
      items: [...cart],
      subtotal: grossSubtotal,
      totalDiscount: memberSavings,
      memberDiscountSavings: memberSavings,
      totalNet: netTotal,
      paymentMethod: method,
      cashTendered,
      change,
      memberId: activeMember?.id,
      memberName: activeMember?.name,
      memberNak: activeMember?.nak,
      cashierName: currentShift.cashierName,
      status: 'completed',
      notes,
    };

    // 1. Deduct Product Stocks
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity),
          };
        }
        return p;
      })
    );

    // 2. Update Member stats (points, savings deduction if applicable, totalSpent)
    if (activeMember) {
      const earnedPoints = Math.floor(netTotal / 10000); // 1 point per Rp 10.000 spent
      const updatedSavings =
        method === 'savings'
          ? Math.max(0, activeMember.savingsBalance - netTotal)
          : activeMember.savingsBalance;

      const updatedMember: Member = {
        ...activeMember,
        savingsBalance: updatedSavings,
        points: activeMember.points + earnedPoints,
        totalSpent: activeMember.totalSpent + netTotal,
      };

      setMembers((prevMembers) =>
        prevMembers.map((m) => (m.id === activeMember.id ? updatedMember : m))
      );
      setActiveMember(updatedMember);
    }

    // 3. Update Shift Cashier Totals
    setCurrentShift((prevShift) => {
      const isCash = method === 'cash';
      const cashDelta = isCash ? netTotal : 0;
      const nonCashDelta = !isCash ? netTotal : 0;
      return {
        ...prevShift,
        cashSales: prevShift.cashSales + cashDelta,
        nonCashSales: prevShift.nonCashSales + nonCashDelta,
        expectedCash: prevShift.expectedCash + cashDelta,
      };
    });

    // 4. Save transaction log
    setTransactions((prevTxs) => [newTx, ...prevTxs]);

    // 5. Close payment modal, show receipt, clear cart
    setIsPaymentModalOpen(false);
    setActiveReceiptTx(newTx);
    setCart([]);
  };

  // Shift Close handler
  const handleCloseShift = (
    actualCash: number,
    newOpeningCash: number,
    newCashierName: string
  ) => {
    const closedShift: CashierShift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      actualCash,
      variance: actualCash - currentShift.expectedCash,
      status: 'closed',
    };

    // Save history / create new open shift
    const nextShift: CashierShift = {
      id: 'shift-' + Date.now(),
      cashierName: newCashierName,
      startTime: new Date().toISOString(),
      openingCash: newOpeningCash,
      cashSales: 0,
      nonCashSales: 0,
      expectedCash: newOpeningCash,
      status: 'open',
    };

    setCurrentShift(nextShift);
  };

  // Product CRUD
  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Member CRUD
  const handleAddMember = (member: Member) => {
    setMembers((prev) => [member, ...prev]);
  };

  const handleUpdateMember = (member: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
    if (activeMember && activeMember.id === member.id) {
      setActiveMember(member);
    }
  };

  // Reset to default
  const handleResetData = () => {
    resetAllToDefaults();
    setProducts(loadProducts());
    setMembers(loadMembers());
    setTransactions(loadTransactions());
    setSettings(loadSettings());
    setCurrentShift(loadShift());
    setCart([]);
    setActiveMember(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        currentShift={currentShift}
        settings={settings}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TAB 1: POS / KASIR */}
        {activeTab === 'pos' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-64px)] overflow-hidden">
            {/* Left: Product Catalog Grid (8 cols on lg) */}
            <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
              <ProductGrid
                products={products}
                activeMember={activeMember}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* Right: Active Cart Drawer (4 cols on lg) */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
              <CartDrawer
                cart={cart}
                activeMember={activeMember}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onOpenMemberModal={() => setIsMemberModalOpen(true)}
                onDetachMember={() => setActiveMember(null)}
                onCheckout={() => setIsPaymentModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: KATALOG & STOK */}
        {activeTab === 'products' && (
          <div className="flex-1 overflow-y-auto">
            <ProductManager
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}

        {/* TAB 3: ANGGOTA KOPMA */}
        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto">
            <MemberManager
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
            />
          </div>
        )}

        {/* TAB 4: LAPORAN & TRANSAKSI */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto">
            <ReportsDashboard
              transactions={transactions}
              settings={settings}
              onViewReceipt={(tx) => setActiveReceiptTx(tx)}
            />
          </div>
        )}

        {/* TAB 5: PENGATURAN TOKO */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto">
            <StoreSettings
              settings={settings}
              onSaveSettings={(newSettings) => setSettings(newSettings)}
              onResetData={handleResetData}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Member Selector Modal */}
      <MemberSelectModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onSelectMember={(member) => setActiveMember(member)}
        onAddNewMember={handleAddMember}
      />

      {/* 2. Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalNet={netTotal}
        totalGross={grossSubtotal}
        totalSavings={memberSavings}
        activeMember={activeMember}
        settings={settings}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* 3. Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceiptTx}
        onClose={() => setActiveReceiptTx(null)}
        transaction={activeReceiptTx}
        settings={settings}
        onNewTransaction={() => {
          setActiveReceiptTx(null);
          setActiveMember(null);
        }}
      />

      {/* 4. Cashier Shift Reconciliation Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shift={currentShift}
        settings={settings}
        onCloseShift={handleCloseShift}
      />
    </div>
  );
};
