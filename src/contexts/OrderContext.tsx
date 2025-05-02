import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderContextType,
} from "../types/order";
import { useRestaurant } from "./RestaurantContext";
import toast from "react-hot-toast";

// Constants for localStorage keys
const STORAGE_KEY_ORDERS = "restaurantApp_orders";

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage or empty array
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        return parsed.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const { updateTableStatus } = useRestaurant();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  const getOrdersByTable = (tableId: string) =>
    orders.filter((o) => o.tableId === tableId);

  const getOrderById = (id: string) => orders.find((o) => o.id === id);

  const calculateTotalAmount = (items: OrderItem[]) =>
    items.reduce((sum, item) => {
      let itemTotal = item.price * item.quantity;
      if (item.modifiers) {
        item.modifiers.forEach((mod) =>
          mod.options.forEach((opt) => {
            itemTotal += opt.price * item.quantity;
          })
        );
      }
      return sum + itemTotal;
    }, 0);

  const createOrder = (
    tableId: string,
    items: Omit<OrderItem, "id" | "status">[]
  ) => {
    const orderItems: OrderItem[] = items.map((item) => ({
      ...item,
      id: uuidv4(),
      status: "pending",
    }));

    const newOrder: Order = {
      id: uuidv4(),
      tableId,
      tableNumber: parseInt(tableId.split("-").pop() || "0", 10),
      items: orderItems,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      totalAmount: calculateTotalAmount(orderItems),
    };

    setOrders((prev) => [...prev, newOrder]);
    updateTableStatus(tableId, "occupied");
    toast.success("Order created successfully");
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              items: order.items.map((i) => ({ ...i, status })),
              updatedAt: new Date(),
            }
          : order
      )
    );

    // if completed/cancelled, free table if no other active orders
    const justUpdated = getOrderById(orderId);
    if (justUpdated && ["completed", "cancelled"].includes(status)) {
      const others = orders.filter(
        (o) =>
          o.tableId === justUpdated.tableId &&
          o.id !== orderId &&
          !["completed", "cancelled"].includes(o.status)
      );
      if (others.length === 0) {
        updateTableStatus(justUpdated.tableId, "available");
      }
    }

    toast.success(`Order status updated to ${status}`);
  };

  const updateOrderItemStatus = (
    orderId: string,
    itemId: string,
    status: OrderStatus
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, status } : item
        );
        const allSame = updatedItems.every((i) => i.status === status);
        return {
          ...order,
          items: updatedItems,
          status: allSame ? status : order.status,
          updatedAt: new Date(),
        };
      })
    );
    toast.success(`Item status updated to ${status}`);
  };

  const addItemToOrder = (
    orderId: string,
    item: Omit<OrderItem, "id" | "status">
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const newItem: OrderItem = {
          ...item,
          id: uuidv4(),
          status: "pending",
        };
        const updatedItems = [...order.items, newItem];
        return {
          ...order,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
          updatedAt: new Date(),
        };
      })
    );
    toast.success("Item added to order");
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.filter((i) => i.id !== itemId);
        return {
          ...order,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
          updatedAt: new Date(),
        };
      })
    );
    toast.success("Item removed from order");
  };

  const completeOrder = (
    orderId: string,
    paymentDetails: { amount: number; splitBill?: boolean }
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const loyaltyPoints = Math.floor(paymentDetails.amount / 10);
        return {
          ...order,
          status: "completed",
          paidAmount: paymentDetails.amount,
          splitBill: paymentDetails.splitBill ?? false,
          loyaltyPointsEarned: loyaltyPoints,
          updatedAt: new Date(),
        };
      })
    );

    // free table if no other active orders
    const justDone = getOrderById(orderId);
    if (justDone) {
      const others = orders.filter(
        (o) =>
          o.tableId === justDone.tableId &&
          o.id !== orderId &&
          !["completed", "cancelled"].includes(o.status)
      );
      if (others.length === 0) {
        updateTableStatus(justDone.tableId, "available");
      }
    }

    toast.success("Payment completed");
  };

  const provideFeedback = (
    orderId: string,
    feedback: { rating: number; comment?: string }
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, feedback } : order
      )
    );
    toast.success("Thank you for your feedback!");
  };

  const value: OrderContextType = {
    orders,
    getOrdersByTable,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    addItemToOrder,
    removeItemFromOrder,
    completeOrder,
    provideFeedback,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
