import { Table, TableStatus } from '../../types/restaurant';
import { Order } from '../../types/order';
import { Users, DollarSign, Timer, FileEdit } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  orders: Order[];
  onTableAction: (table: Table, action: 'occupy' | 'reserve' | 'clear') => void;
}

const TableGrid = ({ tables, orders, onTableAction }: TableGridProps) => {
  // Get active orders for each table
  const getTableOrders = (tableId: string) => {
    return orders.filter(
      order => order.tableId === tableId && !['completed', 'cancelled'].includes(order.status)
    );
  };
  
  const getTableTotalAmount = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.reduce((total, order) => total + order.totalAmount, 0);
  };
  
  const getOccupationTime = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    if (tableOrders.length === 0) return null;
    
    // Find earliest order creation time
    const earliestOrder = tableOrders.reduce((earliest, order) => {
      const orderTime = new Date(order.createdAt).getTime();
      return orderTime < earliest ? orderTime : earliest;
    }, Infinity);
    
    // Calculate minutes elapsed
    const elapsedMinutes = Math.floor((Date.now() - earliestOrder) / 60000);
    return elapsedMinutes;
  };
  
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reserved':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Tables Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => {
          const tableOrders = getTableOrders(table.id);
          const totalAmount = getTableTotalAmount(table.id);
          const occupationTime = getOccupationTime(table.id);
          
          return (
            <div 
              key={table.id} 
              className={`border rounded-lg overflow-hidden ${
                table.status === 'occupied' ? 'border-red-300' : 
                table.status === 'reserved' ? 'border-amber-300' : 'border-gray-200'
              }`}
            >
              <div className={`p-4 ${
                table.status === 'occupied' ? 'bg-red-50' : 
                table.status === 'reserved' ? 'bg-amber-50' : 'bg-white'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Table {table.number}</h3>
                    <p className="text-sm text-gray-600">Capacity: {table.capacity} people</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(table.status)}`}>
                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </span>
                </div>
                
                {table.status !== 'available' && (
                  <div className="mt-3 space-y-2">
                    {tableOrders.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center text-gray-600">
                          <FileEdit size={16} className="mr-1" />
                          Active Orders:
                        </span>
                        <span>{tableOrders.length}</span>
                      </div>
                    )}
                    
                    {totalAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-1" />
                          Tab Amount:
                        </span>
                        <span className="font-medium">${totalAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {occupationTime !== null && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center text-gray-600">
                          <Timer size={16} className="mr-1" />
                          Time Occupied:
                        </span>
                        <span>
                          {occupationTime < 60 
                            ? `${occupationTime}m` 
                            : `${Math.floor(occupationTime / 60)}h ${occupationTime % 60}m`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 p-3 bg-white flex gap-2">
                {table.status === 'available' ? (
                  <>
                    <button
                      onClick={() => onTableAction(table, 'occupy')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-lg text-sm"
                    >
                      Occupy
                    </button>
                    <button
                      onClick={() => onTableAction(table, 'reserve')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1 rounded-lg text-sm"
                    >
                      Reserve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onTableAction(table, 'clear')}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 rounded-lg text-sm"
                  >
                    Clear Table
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableGrid;