import { useState, useEffect } from "react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { useOrder } from "../contexts/OrderContext";
import { MenuItem, MenuCategory } from "../types/restaurant";
import { OrderItem, OrderStatus } from "../types/order";
import toast from "react-hot-toast";
import {
  X,
  ShoppingCart,
  Clock,
  Check,
  ChevronLeft,
  Menu,
  Star,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import MenuItemCard from "../components/customer/MenuItemCard";
import OrderStatusBadge from "../components/shared/OrderStatusBadge";
import CartItem from "../components/customer/CartItem";
import FeedbackForm from "../components/customer/FeedbackForm";
import PaymentModal from "../components/customer/PaymentModal";
import OrderTimer from "../components/customer/OrderTimer";

interface CustomerViewProps {
  tableId: string;
  onLogout: () => void;
}

const STORAGE_KEY_CART = "restaurantApp_cart_";

const CustomerView = ({ tableId, onLogout }: CustomerViewProps) => {
  const { tables, menuCategories } = useRestaurant();
  const { getOrdersByTable, createOrder, orders } = useOrder();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<
    (OrderItem & { menuItem: MenuItem })[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState<
    ReturnType<typeof getOrdersByTable>
  >([]);
  const [completedOrders, setCompletedOrders] = useState<
    ReturnType<typeof getOrdersByTable>
  >([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"menu" | "orders">("menu");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const table = tables.find((t) => t.id === tableId);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`${STORAGE_KEY_CART}${tableId}`);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
        // Clear corrupted cart data
        localStorage.removeItem(`${STORAGE_KEY_CART}${tableId}`);
      }
    }
  }, [tableId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_CART}${tableId}`,
      JSON.stringify(cartItems)
    );
  }, [cartItems, tableId]);

  // Initialize orders and default category
  useEffect(() => {
    // Get initial orders
    updateOrders();

    // Set default category if none selected
    if (!selectedCategory && menuCategories.length > 0) {
      setSelectedCategory(menuCategories[0].id);
    }

    // Setup interval to refresh orders
    const intervalId = setInterval(updateOrders, 5000);

    return () => clearInterval(intervalId);
  }, [tableId, menuCategories]);

  // Listen for changes to the orders array from context
  useEffect(() => {
    // Store previous order statuses to detect changes
    const prevActiveOrders = activeOrders;
    updateOrders();
    
    // Check for status changes in orders and show notifications
    if (prevActiveOrders.length > 0) {
      activeOrders.forEach(order => {
        const prevOrder = prevActiveOrders.find(o => o.id === order.id);
        if (prevOrder && prevOrder.status !== order.status) {
          // Show status change notification
          switch (order.status) {
            case 'preparing':
              toast('The kitchen is now preparing your food!', {
                icon: '👨‍🍳',
                duration: 3000,
              });
              break;
            case 'ready':
              toast('Your food is ready! It will be served shortly.', {
                icon: '🍽️',
                duration: 4000,
              });
              break;
            case 'served':
              toast('Your food has been served. Enjoy your meal!', {
                icon: '😋',
                duration: 3000,
              });
              break;
            default:
              break;
          }
        }
      });
    }
  }, [orders, tableId]);


  const updateOrders = () => {
    const tableOrders = getOrdersByTable(tableId);
    setActiveOrders(
      tableOrders.filter(
        (order) => !["completed", "cancelled"].includes(order.status)
      )
    );
    setCompletedOrders(
      tableOrders.filter((order) =>
        ["completed", "cancelled"].includes(order.status)
      )
    );
  };

  const handleAddToCart = (
    menuItem: MenuItem,
    quantity: number = 1,
    modifiers?: any[]
  ) => {
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.menuItemId === menuItem.id &&
        JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedCartItems);
    } else {
      // Add new item
      setCartItems([
        ...cartItems,
        {
          id: `temp-${Date.now()}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
          modifiers,
          status: "pending",
          menuItem,
        },
      ]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    setCartItems(updatedCartItems);
  };

  const handleUpdateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    // Format cart items for order creation
    const orderItems = cartItems.map(({ menuItem, ...item }) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      modifiers: item.modifiers,
    }));

    // Create order
    const newOrder = createOrder(tableId, orderItems);
    console.log("New order created:", newOrder);

    // Clear cart
    setCartItems([]);
    localStorage.removeItem(`${STORAGE_KEY_CART}${tableId}`);
    setIsCartOpen(false);

    // Update orders list
    updateOrders();

    // Show notification
    toast.success("Order placed successfully! You can track your food preparation status.");

    // Switch to orders view
    setViewMode("orders");
  };

  const handleRequestPayment = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsPaymentModalOpen(true);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    let itemTotal = item.price * item.quantity;

    // Add modifier prices
    if (item.modifiers) {
      item.modifiers.forEach((modifier) => {
        modifier.options?.forEach((option) => {
          itemTotal += option.price * item.quantity;
        });
      });
    }

    return total + itemTotal;
  }, 0);

  const currentCategory = menuCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {/* {table ? `Table ${table.number}` : "Loading..."} */}
              Customer Table
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-500 transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>

            <div
              className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 transition-opacity duration-300 ${
                isMobileMenuOpen
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>

                <div className="mt-12 space-y-4">
                  <button
                    onClick={() => {
                      setViewMode("menu");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-4 rounded-lg ${
                      viewMode === "menu"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    Menu
                  </button>

                  <button
                    onClick={() => {
                      setViewMode("orders");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-4 rounded-lg ${
                      viewMode === "orders"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    Your Orders
                    {activeOrders.length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {activeOrders.length}
                      </span>
                    )}
                  </button>

                  <hr className="my-2" />

                  <button
                    onClick={onLogout}
                    className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Exit Table
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => setViewMode("menu")}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "menu"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Menu
              </button>

              <button
                onClick={() => setViewMode("orders")}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "orders"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Your Orders
                {activeOrders.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {activeOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg"
              >
                Exit Table
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {viewMode === "menu" ? (
          <>
            {/* Categories */}
            <div className="mb-6 overflow-x-auto py-2">
              <div className="flex space-x-2 min-w-max">
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCategory?.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Current Orders
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-sm text-gray-500">
                            Order #{order.id.substring(0, 8)}
                          </span>
                          <div className="flex items-center mt-1">
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <OrderTimer 
                            orderId={order.id}
                            orderStatus={order.status}
                            createdAt={order.createdAt}
                            estimatedTime={15}
                          />
                        </div>
                        <span className="font-semibold text-lg">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center border-b border-gray-100 pb-2"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.quantity}x {item.name}
                              </p>
                              {item.modifiers && item.modifiers.length > 0 && (
                                <ul className="text-sm text-gray-500">
                                  {item.modifiers.map((mod, idx) => (
                                    <li key={idx}>
                                      {mod.name}:{" "}
                                      {mod.options
                                        .map((opt) => opt.name)
                                        .join(", ")}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {item.notes && (
                                <p className="text-sm text-gray-500">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center">
                              <OrderStatusBadge status={item.status} small />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleRequestPayment(order.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          Request Bill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Past Orders
                </h2>
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-sm text-gray-500">
                            Order #{order.id.substring(0, 8)}
                          </span>
                          <div className="flex items-center mt-1">
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <OrderTimer 
                            orderId={order.id}
                            orderStatus={order.status}
                            createdAt={order.createdAt}
                            estimatedTime={15}
                          />
                        </div>
                        <span className="font-semibold text-lg">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center"
                          >
                            <p className="text-gray-600">
                              {item.quantity}x {item.name}
                            </p>
                            <p className="text-gray-700">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-gray-500 text-sm">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>

                      {order.status === "completed" && !order.feedback && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <FeedbackForm orderId={order.id} />
                        </div>
                      )}

                      {order.feedback && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < order.feedback!.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {order.loyaltyPointsEarned} loyalty points earned
                            </span>
                          </div>
                          {order.feedback.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {order.feedback.comment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeOrders.length === 0 && completedOrders.length === 0 && (
              <div className="text-center py-10">
                <div className="text-gray-400 mb-4">
                  <ShoppingCart size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Browse the menu and place your first order
                </p>
                <button
                  onClick={() => setViewMode("menu")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  View Menu
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Your Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <ShoppingCart size={64} className="mx-auto" />
                </div>
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <CartItem
                    key={index}
                    item={item}
                    onRemove={() => handleRemoveFromCart(index)}
                    onUpdateQuantity={(quantity) =>
                      handleUpdateCartItemQuantity(index, quantity)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-lg">Total</span>
              <span className="font-semibold text-xl">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrderId && (
        <PaymentModal
          orderId={selectedOrderId}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrderId(null);
            // Refresh orders list
            updateOrders();
          }}
        />
      )}
    </div>
  );
};

export default CustomerView;
