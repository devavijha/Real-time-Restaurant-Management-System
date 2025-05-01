import { useState } from 'react';
import { Order, OrderStatus } from '../../types/order';
import { Check, X } from 'lucide-react';
import OrderStatusBadge from '../shared/OrderStatusBadge';

interface OrderFeedProps {
  orders: Order[];
  onOrderAction: (order: Order, action: 'accept' | 'reject' | 'complete') => void;
}

const OrderFeed = ({ orders, onOrderAction }: OrderFeedProps) => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  
  // Sort orders by date (newest first) and filter by status if needed
  const filteredOrders = orders
    .filter(order => filter === 'all' || order.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Order Feed</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('preparing')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'preparing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'completed' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders match the current filter</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Table {order.tableNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Order #{order.id.substring(0, 8)}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className="font-semibold text-lg">${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">Items</h4>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <ul className="text-sm text-gray-500">
                            {item.modifiers.map((mod, idx) => (
                              <li key={idx}>
                                {mod.name}: {mod.options.map(opt => opt.name).join(', ')}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex items-center">
                        <OrderStatusBadge status={item.status} small />
                        <span className="ml-3 text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onOrderAction(order, 'reject')}
                      className="flex items-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => onOrderAction(order, 'accept')}
                      className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                    >
                      <Check size={16} className="mr-1" />
                      Accept
                    </button>
                  </>
                )}
                
                {['preparing', 'ready', 'served'].includes(order.status) && (
                  <button
                    onClick={() => onOrderAction(order, 'complete')}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    <Check size={16} className="mr-1" />
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderFeed;