import { Product, Member, Transaction, CashierShift, KopmaSettings } from '../types';
import { initialProducts, initialMembers, initialTransactions, initialSettings, initialShift } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'kopma_products_v1',
  MEMBERS: 'kopma_members_v1',
  TRANSACTIONS: 'kopma_transactions_v1',
  SETTINGS: 'kopma_settings_v1',
  SHIFT: 'kopma_shift_v1',
};

export function loadProducts(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : initialProducts;
  } catch {
    return initialProducts;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

export function loadMembers(): Member[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : initialMembers;
  } catch {
    return initialMembers;
  }
}

export function saveMembers(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members:', e);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

export function loadSettings(): KopmaSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...initialSettings, ...JSON.parse(data) } : initialSettings;
  } catch {
    return initialSettings;
  }
}

export function saveSettings(settings: KopmaSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function loadShift(): CashierShift {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFT);
    return data ? JSON.parse(data) : initialShift;
  } catch {
    return initialShift;
  }
}

export function saveShift(shift: CashierShift): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(shift));
  } catch (e) {
    console.error('Error saving shift:', e);
  }
}

export function resetAllToDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.SHIFT);
}
