export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: {
    name: string;
    options: {
      name: string;
      price: number;
    }[];
  }[];
  notes?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
  paidAmount?: number;
  splitBill?: boolean;
  loyaltyPointsEarned?: number;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface OrderContextType {
  orders: Order[];
  getOrdersByTable: (tableId: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (tableId: string, items: Omit<OrderItem, 'id' | 'status'>[]) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus) => void;
  addItemToOrder: (orderId: string, item: Omit<OrderItem, 'id' | 'status'>) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  completeOrder: (orderId: string, paymentDetails: { amount: number; splitBill?: boolean }) => void;
  provideFeedback: (orderId: string, feedback: { rating: number; comment?: string }) => void;
}