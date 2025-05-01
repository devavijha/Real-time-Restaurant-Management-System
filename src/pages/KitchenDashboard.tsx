import { useState } from 'react';
import { useOrder } from '../contexts/OrderContext';
import { Order, OrderItem, OrderStatus } from '../types/order';
import { LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
import OrderStatusBadge from '../components/shared/OrderStatusBadge';

interface KitchenDashboardProps {
  onLogout: () => void;
}

const KitchenDashboard = ({ onLogout }: KitchenDashboardProps) => {
  const { orders, updateOrderItemStatus } = useOrder();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('pending');
  
  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    
    // Check if any item in the order has the filtered status
    return order.items.some(item => item.status === filter);
  });
  
  const handleUpdateItemStatus = (orderId: string, itemId: string, status: OrderStatus) => {
    updateOrderItemStatus(orderId, itemId, status);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Kitchen Dashboard</h1>
          <button 
            onClick={onLogout}
            className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg"
          >
            <LogOut size={18} className="mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow p-1 flex">
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              filter === 'pending' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            New Orders
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              filter === 'preparing' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              filter === 'ready' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              filter === 'all' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
        </div>
        
        {/* Orders Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <div className="text-gray-400 mb-4">
                <CheckCircle size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-700">All caught up!</h3>
              <p className="text-gray-500">No orders matching the current filter</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateItemStatus={handleUpdateItemStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onUpdateItemStatus: (orderId: string, itemId: string, status: OrderStatus) => void;
}

const OrderCard = ({ order, onUpdateItemStatus }: OrderCardProps) => {
  const timeElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Table {order.tableNumber}</h3>
          <div className="text-xs text-gray-300 flex items-center mt-1">
            <Clock size={12} className="mr-1" />
            {timeElapsed === 0 ? 'Just now' : `${timeElapsed} min ago`}
          </div>
        </div>
        <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
          Order #{order.id.substring(0, 6)}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {order.items.map(item => (
          <OrderItemCard 
            key={item.id} 
            item={item}
            orderId={order.id}
            onUpdateStatus={onUpdateItemStatus}
          />
        ))}
      </div>
    </div>
  );
};

interface OrderItemCardProps {
  item: OrderItem;
  orderId: string;
  onUpdateStatus: (orderId: string, itemId: string, status: OrderStatus) => void;
}

const OrderItemCard = ({ item, orderId, onUpdateStatus }: OrderItemCardProps) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">{item.quantity}x {item.name}</p>
          {item.modifiers && item.modifiers.length > 0 && (
            <ul className="text-sm text-gray-500 mt-1">
              {item.modifiers.map((mod, idx) => (
                <li key={idx}>
                  {mod.name}: {mod.options.map(opt => opt.name).join(', ')}
                </li>
              ))}
            </ul>
          )}
          {item.notes && <p className="text-sm text-gray-500 italic mt-1">Note: {item.notes}</p>}
        </div>
        <OrderStatusBadge status={item.status} />
      </div>
      
      <div className="flex space-x-2 mt-3">
        {item.status === 'pending' && (
          <>
            <button 
              onClick={() => onUpdateStatus(orderId, item.id, 'preparing')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-lg text-sm font-medium"
            >
              Start Preparing
            </button>
            <button 
              onClick={() => onUpdateStatus(orderId, item.id, 'cancelled')}
              className="bg-red-100 hover:bg-red-200 text-red-600 py-1 px-3 rounded-lg text-sm"
            >
              <XCircle size={16} />
            </button>
          </>
        )}
        
        {item.status === 'preparing' && (
          <button 
            onClick={() => onUpdateStatus(orderId, item.id, 'ready')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded-lg text-sm font-medium"
          >
            Mark as Ready
          </button>
        )}
        
        {item.status === 'ready' && (
          <button 
            disabled
            className="flex-1 bg-gray-100 text-gray-500 py-1 rounded-lg text-sm font-medium"
          >
            Waiting for Service
          </button>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;