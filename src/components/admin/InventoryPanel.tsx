import { useState } from 'react';
import { Search, RefreshCw, AlertCircle, Percent, Package, DollarSign } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
  price: number;
  lastUpdated: Date;
}

const InventoryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  
  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Flour',
      category: 'Dry Goods',
      stock: 25,
      unit: 'kg',
      threshold: 10,
      price: 1.5,
      lastUpdated: new Date('2025-01-15')
    },
    {
      id: '2',
      name: 'Tomatoes',
      category: 'Produce',
      stock: 8,
      unit: 'kg',
      threshold: 10,
      price: 2.99,
      lastUpdated: new Date('2025-01-17')
    },
    {
      id: '3',
      name: 'Mozzarella Cheese',
      category: 'Dairy',
      stock: 15,
      unit: 'kg',
      threshold: 5,
      price: 9.99,
      lastUpdated: new Date('2025-01-16')
    },
    {
      id: '4',
      name: 'Olive Oil',
      category: 'Oils',
      stock: 5,
      unit: 'L',
      threshold: 10,
      price: 12.99,
      lastUpdated: new Date('2025-01-14')
    },
    {
      id: '5',
      name: 'Pepperoni',
      category: 'Meats',
      stock: 7,
      unit: 'kg',
      threshold: 3,
      price: 15.99,
      lastUpdated: new Date('2025-01-15')
    },
    {
      id: '6',
      name: 'Red Wine',
      category: 'Beverages',
      stock: 2,
      unit: 'bottles',
      threshold: 5,
      price: 18.99,
      lastUpdated: new Date('2025-01-13')
    },
    {
      id: '7',
      name: 'Basil',
      category: 'Herbs',
      stock: 4,
      unit: 'bunches',
      threshold: 5,
      price: 3.99,
      lastUpdated: new Date('2025-01-17')
    },
    {
      id: '8',
      name: 'Garlic',
      category: 'Produce',
      stock: 20,
      unit: 'heads',
      threshold: 8,
      price: 0.99,
      lastUpdated: new Date('2025-01-16')
    }
  ];
  
  // Filter items based on search term and filter
  const filteredItems = inventoryItems
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item => filter === 'all' || (filter === 'low' && item.stock < item.threshold));
  
  // Calculate inventory stats
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.stock < item.threshold).length;
  const totalValue = inventoryItems.reduce((total, item) => total + (item.stock * item.price), 0);
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Inventory Management</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg mr-3">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-xl font-semibold">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 text-red-800 rounded-lg mr-3">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-xl font-semibold">{lowStockItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 text-green-800 rounded-lg mr-3">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-xl font-semibold">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'low' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory..."
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${item.stock < item.threshold ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stock < item.threshold && <AlertCircle size={16} className="mr-1 flex-shrink-0" />}
                      <span>{item.stock} {item.unit}</span>
                    </div>
                    {item.stock < item.threshold && (
                      <div className="text-xs text-red-600 mt-1">Below threshold ({item.threshold})</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    ${item.price.toFixed(2)} / {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {item.lastUpdated.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;