import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Table, MenuItem, MenuCategory, TableStatus, RestaurantContextType } from '../types/restaurant';
import { generateMockTables, generateMockMenuItems, generateMockCategories } from '../services/mockData';
import { simulateWebSocket } from '../services/mockWebSocket';

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [tables, setTables] = useState<Table[]>(generateMockTables());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(generateMockMenuItems());
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(generateMockCategories());

  useEffect(() => {
    // Setup mock WebSocket for real-time updates
    const unsubscribe = simulateWebSocket<Table[]>('tables', (updatedTables) => {
      setTables(updatedTables);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getTable = (id: string) => {
    return tables.find(table => table.id === id);
  };

  const updateTableStatus = (id: string, status: TableStatus) => {
    const updatedTables = tables.map(table => 
      table.id === id ? { ...table, status } : table
    );
    setTables(updatedTables);
  };

  const getMenuItem = (id: string) => {
    return menuItems.find(item => item.id === id);
  };

  const value = {
    tables,
    menuItems,
    menuCategories,
    getTable,
    updateTableStatus,
    getMenuItem
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};