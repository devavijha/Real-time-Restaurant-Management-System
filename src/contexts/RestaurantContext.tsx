import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  Table,
  MenuItem,
  MenuCategory,
  TableStatus,
  RestaurantContextType,
} from "../types/restaurant";
import {
  generateMockTables,
  generateMockMenuItems,
  generateMockCategories,
} from "../services/mockData";

// Constants for localStorage keys
const STORAGE_KEY_TABLES = "restaurantApp_tables";
const STORAGE_KEY_MENU_ITEMS = "restaurantApp_menuItems";
const STORAGE_KEY_MENU_CATEGORIES = "restaurantApp_menuCategories";

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage or generate mock data
  const [tables, setTables] = useState<Table[]>(() => {
    const savedTables = localStorage.getItem(STORAGE_KEY_TABLES);
    if (savedTables) {
      try {
        return JSON.parse(savedTables);
      } catch (e) {
        console.error("Failed to parse saved tables", e);
        return generateMockTables();
      }
    }
    return generateMockTables();
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const savedMenuItems = localStorage.getItem(STORAGE_KEY_MENU_ITEMS);
    if (savedMenuItems) {
      try {
        return JSON.parse(savedMenuItems);
      } catch (e) {
        console.error("Failed to parse saved menu items", e);
        return generateMockMenuItems();
      }
    }
    return generateMockMenuItems();
  });

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(() => {
    const savedCategories = localStorage.getItem(STORAGE_KEY_MENU_CATEGORIES);
    if (savedCategories) {
      try {
        return JSON.parse(savedCategories);
      } catch (e) {
        console.error("Failed to parse saved menu categories", e);
        return generateMockCategories();
      }
    }
    return generateMockCategories();
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_MENU_CATEGORIES,
      JSON.stringify(menuCategories)
    );
  }, [menuCategories]);

  const getTable = (id: string) => {
    return tables.find((table) => table.id === id);
  };

  const updateTableStatus = (id: string, status: TableStatus) => {
    console.log(`Updating table ${id} status to ${status}`);
    const updatedTables = tables.map((table) =>
      table.id === id ? { ...table, status } : table
    );
    setTables(updatedTables);
  };

  const getMenuItem = (id: string) => {
    return menuItems.find((item) => item.id === id);
  };

  const value = {
    tables,
    menuItems,
    menuCategories,
    getTable,
    updateTableStatus,
    getMenuItem,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
