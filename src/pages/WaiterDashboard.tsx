import { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useOrder } from '../contexts/OrderContext';
import { Table as TableType } from '../types/restaurant';
import { Order, OrderStatus } from '../types/order';
import { LogOut, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import OrderStatusBadge from '../components/shared/OrderStatusBadge';

interface WaiterDashboardProps {
  onLogout: () => void;
}

const WaiterDashboard = ({ onLogout }: WaiterDashboardProps) => {
  const { tables } = useRestaurant();
  const { orders, getOrdersByTable, updateOrderStatus, updateOrderItemStatus } = useOrder();
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  
  const tableOrders = selectedTable 
    ? getOrdersByTable(selectedTable.id).filter(order => !['completed', 'cancelled'].includes(order.status))
    : [];
  
  // Orders that need waiter attention
  const pendingOrders = orders.filter(order => {
    // Include orders with "ready" items that need to be served
    return order.items.some(item => item.status === 'ready');
  });
  
  const handleItemServe = (orderId: string, itemId: string) => {
    updateOrderItemStatus(orderId, itemId, 'served');
  };
  
  const handleMarkOrderComplete = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Waiter Dashboard</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Selection */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tables</h2>
            <div className="space-y-2">
              {tables.map(table => {
                const tableOrdersCount = orders.filter(
                  o => o.tableId === table.id && !['completed', 'cancelled'].includes(o.status)
                ).length;
                
                const hasReadyItems = orders.some(order => 
                  order.tableId === table.id && 
                  order.items.some(item => item.status === 'ready')
                );
                
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg ${
                      selectedTable?.id === table.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                    } ${hasReadyItems ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        table.status === 'available' ? 'bg-green-500' :
                        table.status === 'reserved' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></div>
                      <span>Table {table.number}</span>
                    </div>
                    
                    {tableOrdersCount > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        hasReadyItems 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {tableOrdersCount} {tableOrdersCount === 1 ? 'order' : 'orders'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Order Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            {selectedTable ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Table {selectedTable.number}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedTable.status === 'available' ? 'bg-green-100 text-green-800' :
                      selectedTable.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {tableOrders.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-gray-400 mb-4">
                        <CheckCircle size={64} className="mx-auto" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-700">No active orders</h3>
                      <p className="text-gray-500">This table doesn't have any active orders</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {tableOrders.map(order => (
                        <div key={order.id} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 flex justify-between items-center">
                            <div>
                              <span className="text-sm text-gray-500">
                                Order #{order.id.substring(0, 8)}
                              </span>
                              <div className="flex items-center mt-1">
                                <OrderStatusBadge status={order.status} />
                                <span className="ml-2 text-xs text-gray-500 flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {new Date(order.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="p-3 space-y-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <div>
                                  <p className="font-medium">{item.quantity}x {item.name}</p>
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
                                <div className="flex items-center space-x-2">
                                  <OrderStatusBadge status={item.status} small />
                                  
                                  {item.status === 'ready' && (
                                    <button
                                      onClick={() => handleItemServe(order.id, item.id)}
                                      className="bg-green-100 hover:bg-green-200 text-green-600 p-1 rounded-lg"
                                    >
                                      <ArrowRight size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end">
                            <button
                              onClick={() => handleMarkOrderComplete(order.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm"
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <ArrowRight size={64} className="mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700">Select a table</h3>
                  <p className="text-gray-500">Choose a table from the list to view orders</p>
                  
                  {pendingOrders.length > 0 && (
                    <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-2">Orders Requiring Attention</h4>
                      <div className="space-y-2">
                        {pendingOrders.slice(0, 3).map(order => (
                          <div key={order.id} className="flex justify-between items-center">
                            <span>Table {order.tableNumber}</span>
                            <button
                              onClick={() => {
                                const table = tables.find(t => t.id === order.tableId);
                                if (table) setSelectedTable(table);
                              }}
                              className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-1 rounded-lg"
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;