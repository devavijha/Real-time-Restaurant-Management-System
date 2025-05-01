import { useState, useEffect } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useOrder } from '../contexts/OrderContext';
import { Table as TableType, TableStatus } from '../types/restaurant';
import { Order } from '../types/order';
import { LogOut, BarChart4, Utensils, Users, Bell, Clock, Package, X } from 'lucide-react';
import TableGrid from '../components/admin/TableGrid';
import OrderFeed from '../components/admin/OrderFeed';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import InventoryPanel from '../components/admin/InventoryPanel';
import NotificationsPanel from '../components/admin/NotificationsPanel';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { tables, updateTableStatus } = useRestaurant();
  const { orders, updateOrderStatus } = useOrder();
  
  const [activeTab, setActiveTab] = useState<'tables' | 'orders' | 'analytics' | 'inventory'>('tables');
  const [notifications, setNotifications] = useState<{id: string; message: string; time: Date}[]>([]);
  
  useEffect(() => {
    // Simulate notifications for demo purposes
    const notificationInterval = setInterval(() => {
      // Random chance of new notification
      if (Math.random() < 0.2) {
        const notificationTypes = [
          'New order placed at Table 3',
          'Table 5 requested payment',
          'Kitchen marked order #12345 as ready',
          'Inventory alert: Low stock on wine',
          'Peak hour starting soon'
        ];
        
        const newNotification = {
          id: `notification-${Date.now()}`,
          message: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          time: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 15000);
    
    return () => clearInterval(notificationInterval);
  }, []);
  
  const handleTableAction = (table: TableType, action: 'occupy' | 'reserve' | 'clear') => {
    let newStatus: TableStatus = 'available';
    
    switch (action) {
      case 'occupy':
        newStatus = 'occupied';
        break;
      case 'reserve':
        newStatus = 'reserved';
        break;
      case 'clear':
        newStatus = 'available';
        break;
    }
    
    updateTableStatus(table.id, newStatus);
  };
  
  const handleOrderAction = (order: Order, action: 'accept' | 'reject' | 'complete') => {
    switch (action) {
      case 'accept':
        updateOrderStatus(order.id, 'preparing');
        break;
      case 'reject':
        updateOrderStatus(order.id, 'cancelled');
        break;
      case 'complete':
        updateOrderStatus(order.id, 'completed');
        break;
    }
  };
  
  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Restaurant Admin</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg"
            >
              <LogOut size={18} className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Notification Banner */}
        {notifications.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800 flex items-center">
                <Bell size={18} className="mr-2 text-blue-500" />
                Recent Notifications
              </h3>
              <button 
                onClick={() => setNotifications([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map(notification => (
                <div key={notification.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">{notification.message}</span>
                    <span className="ml-2 text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {notification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleClearNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {notifications.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{notifications.length - 3} more notifications
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow p-1 flex">
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
              activeTab === 'tables' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Utensils size={18} className="mr-2" />
            Tables
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
              activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={18} className="mr-2" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart4 size={18} className="mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center ${
              activeTab === 'inventory' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package size={18} className="mr-2" />
            Inventory
          </button>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'tables' && (
            <TableGrid 
              tables={tables} 
              orders={orders}
              onTableAction={handleTableAction}
            />
          )}
          
          {activeTab === 'orders' && (
            <OrderFeed 
              orders={orders} 
              onOrderAction={handleOrderAction} 
            />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsPanel 
              orders={orders} 
            />
          )}
          
          {activeTab === 'inventory' && (
            <InventoryPanel />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;