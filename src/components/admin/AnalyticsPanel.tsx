import { useState } from 'react';
import { Order } from '../../types/order';
import { BarChart, LineChart, PieChart, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Bar, Line, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsPanelProps {
  orders: Order[];
}

const AnalyticsPanel = ({ orders }: AnalyticsPanelProps) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  
  // Filter orders based on timeframe
  const filterOrdersByTimeframe = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    switch (timeframe) {
      case 'today':
        return orders.filter(order => new Date(order.createdAt) >= today);
      case 'week':
        return orders.filter(order => new Date(order.createdAt) >= oneWeekAgo);
      case 'month':
        return orders.filter(order => new Date(order.createdAt) >= oneMonthAgo);
      default:
        return orders;
    }
  };
  
  const filteredOrders = filterOrdersByTimeframe();
  
  // Calculate total revenue
  const totalRevenue = filteredOrders.reduce((total, order) => {
    if (order.status === 'completed') {
      return total + order.totalAmount;
    }
    return total;
  }, 0);
  
  // Calculate average order value
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');
  const averageOrderValue = completedOrders.length > 0 
    ? totalRevenue / completedOrders.length 
    : 0;
  
  // Get total number of orders
  const totalOrders = filteredOrders.length;
  
  // Get popular items data
  const popularItems = getPopularItems(filteredOrders);
  
  // Get hourly sales data
  const hourlySalesData = getHourlySalesData(filteredOrders);
  
  // Get daily sales data for the week
  const dailySalesData = getDailySalesData(filteredOrders);
  
  // Get category distribution data
  const categoryData = getCategoryData(filteredOrders);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Analytics Dashboard</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === 'today' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 text-white rounded-lg mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 text-white rounded-lg mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 text-white rounded-lg mr-4">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-gray-600 text-sm">Average Order Value</h3>
              <p className="text-2xl font-bold text-gray-800">${averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Hour</h3>
          <div className="overflow-x-auto">
            <BarChart width={500} height={300} data={hourlySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Sales ($)" />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Revenue</h3>
          <div className="overflow-x-auto">
            <LineChart width={500} height={300} data={dailySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" activeDot={{ r: 8 }} name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="#10B981" name="Orders" />
            </LineChart>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Popular Items</h3>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-sm font-medium text-gray-500">Item</th>
                  <th className="py-2 text-right text-sm font-medium text-gray-500">Orders</th>
                  <th className="py-2 text-right text-sm font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {popularItems.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 text-left">{item.name}</td>
                    <td className="py-2 text-right">{item.count}</td>
                    <td className="py-2 text-right">${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h3>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={categoryData}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions to prepare chart data
function getPopularItems(orders: Order[]) {
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  
  return Object.entries(itemCounts)
    .map(([name, { count, revenue }]) => ({ name, count, revenue }))
    .sort((a, b) => b.count - a.count);
}

function getHourlySalesData(orders: Order[]) {
  const hourlySales: Record<number, { sales: number; orders: number }> = {};
  
  // Initialize data for all hours
  for (let i = 0; i < 24; i++) {
    hourlySales[i] = { sales: 0, orders: 0 };
  }
  
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourlySales[hour].sales += order.totalAmount;
    hourlySales[hour].orders += 1;
  });
  
  return Object.entries(hourlySales).map(([hour, data]) => ({
    hour: `${hour}:00`,
    sales: data.sales,
    orders: data.orders
  }));
}

function getDailySalesData(orders: Order[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailySales: Record<string, { sales: number; orders: number }> = {};
  
  // Initialize data for all days
  days.forEach(day => {
    dailySales[day] = { sales: 0, orders: 0 };
  });
  
  orders.forEach(order => {
    const day = days[new Date(order.createdAt).getDay()];
    dailySales[day].sales += order.totalAmount;
    dailySales[day].orders += 1;
  });
  
  return Object.entries(dailySales).map(([day, data]) => ({
    day,
    sales: data.sales,
    orders: data.orders
  }));
}

function getCategoryData(orders: Order[]) {
  const categories: Record<string, number> = {
    'Pizza': 0,
    'Pasta': 0,
    'Salad': 0,
    'Dessert': 0,
    'Drinks': 0
  };
  
  orders.forEach(order => {
    order.items.forEach(item => {
      // Map item to category based on name (simplified example)
      let category = 'Other';
      
      if (item.name.toLowerCase().includes('pizza')) {
        category = 'Pizza';
      } else if (item.name.toLowerCase().includes('pasta') || item.name.toLowerCase().includes('spaghetti')) {
        category = 'Pasta';
      } else if (item.name.toLowerCase().includes('salad')) {
        category = 'Salad';
      } else if (['tiramisu', 'cheesecake'].some(dessert => item.name.toLowerCase().includes(dessert))) {
        category = 'Dessert';
      } else if (['cola', 'tea', 'lemonade'].some(drink => item.name.toLowerCase().includes(drink))) {
        category = 'Drinks';
      }
      
      categories[category] = (categories[category] || 0) + (item.price * item.quantity);
    });
  });
  
  return Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default AnalyticsPanel;