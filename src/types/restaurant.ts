export type TableStatus = 'available' | 'reserved' | 'occupied';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  qrCode: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number; // in minutes
  customizable: boolean;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  multiSelect: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface RestaurantContextType {
  tables: Table[];
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  getTable: (id: string) => Table | undefined;
  updateTableStatus: (id: string, status: TableStatus) => void;
  getMenuItem: (id: string) => MenuItem | undefined;
}