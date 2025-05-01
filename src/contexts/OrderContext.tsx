import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, OrderContextType } from '../types/order';
import { useRestaurant } from './RestaurantContext';
import { simulateWebSocket } from '../services/mockWebSocket';
import toast from 'react-hot-toast';

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { tables, updateTableStatus } = useRestaurant();

  useEffect(() => {
    // Setup mock WebSocket for real-time updates
    const unsubscribe = simulateWebSocket<Order[]>('orders', (updatedOrders) => {
      setOrders(updatedOrders);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getOrdersByTable = (tableId: string) => {
    return orders.filter(order => order.tableId === tableId);
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const calculateTotalAmount = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      
      // Add any modifier costs
      if (item.modifiers) {
        item.modifiers.forEach(modifier => {
          modifier.options.forEach(option => {
            itemTotal += option.price * item.quantity;
          });
        });
      }
      
      return total + itemTotal;
    }, 0);
  };

  const createOrder = (tableId: string, items: Omit<OrderItem, 'id' | 'status'>[]) => {
    const table = tables.find(t => t.id === tableId);
    
    if (!table) {
      throw new Error(`Table with ID ${tableId} not found`);
    }
    
    const orderItems: OrderItem[] = items.map(item => ({
      ...item,
      id: uuidv4(),
      status: 'pending'
    }));
    
    const newOrder: Order = {
      id: uuidv4(),
      tableId,
      tableNumber: table.number,
      items: orderItems,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      totalAmount: calculateTotalAmount(orderItems)
    };
    
    setOrders([...orders, newOrder]);
    
    // Update table status
    updateTableStatus(tableId, 'occupied');
    
    // Notify
    toast.success('Order created successfully');
    
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        // Update all items to match the order status
        const updatedItems = order.items.map(item => ({
          ...item,
          status
        }));
        
        return {
          ...order,
          status,
          items: updatedItems,
          updatedAt: new Date()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    
    // If order is completed, update table status if this was the last active order
    const completedOrder = updatedOrders.find(o => o.id === orderId);
    if (completedOrder && (status === 'completed' || status === 'cancelled')) {
      const hasActiveOrders = updatedOrders.some(o => 
        o.tableId === completedOrder.tableId && 
        o.id !== orderId && 
        !['completed', 'cancelled'].includes(o.status)
      );
      
      if (!hasActiveOrders) {
        updateTableStatus(completedOrder.tableId, 'available');
      }
    }
    
    toast.success(`Order status updated to ${status}`);
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        
        // Check if all items have the same status
        const allItemsHaveSameStatus = updatedItems.every(item => item.status === status);
        
        return {
          ...order,
          status: allItemsHaveSameStatus ? status : order.status,
          items: updatedItems,
          updatedAt: new Date()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    toast.success(`Item status updated to ${status}`);
  };

  const addItemToOrder = (orderId: string, item: Omit<OrderItem, 'id' | 'status'>) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const newItem: OrderItem = {
          ...item,
          id: uuidv4(),
          status: 'pending'
        };
        
        const updatedItems = [...order.items, newItem];
        
        return {
          ...order,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
          updatedAt: new Date()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    toast.success('Item added to order');
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.filter(item => item.id !== itemId);
        
        return {
          ...order,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
          updatedAt: new Date()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    toast.success('Item removed from order');
  };

  const completeOrder = (orderId: string, paymentDetails: { amount: number; splitBill?: boolean }) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        // Calculate loyalty points (1 point per $10 spent)
        const loyaltyPointsEarned = Math.floor(paymentDetails.amount / 10);
        
        return {
          ...order,
          status: 'completed',
          paidAmount: paymentDetails.amount,
          splitBill: paymentDetails.splitBill || false,
          loyaltyPointsEarned,
          updatedAt: new Date()
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    
    // Check if table has no more active orders
    const completedOrder = updatedOrders.find(o => o.id === orderId);
    if (completedOrder) {
      const hasActiveOrders = updatedOrders.some(o => 
        o.tableId === completedOrder.tableId && 
        o.id !== orderId && 
        !['completed', 'cancelled'].includes(o.status)
      );
      
      if (!hasActiveOrders) {
        updateTableStatus(completedOrder.tableId, 'available');
      }
    }
    
    toast.success('Payment completed');
  };

  const provideFeedback = (orderId: string, feedback: { rating: number; comment?: string }) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, feedback } : order
    );
    
    setOrders(updatedOrders);
    toast.success('Thank you for your feedback!');
  };

  const value = {
    orders,
    getOrdersByTable,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    addItemToOrder,
    removeItemFromOrder,
    completeOrder,
    provideFeedback
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};