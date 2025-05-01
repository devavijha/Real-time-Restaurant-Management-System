import { v4 as uuidv4 } from 'uuid';
import { Table, MenuItem, MenuCategory, Modifier } from '../types/restaurant';
import { User } from '../types/auth';

export const generateMockUsers = (): User[] => {
  return [
    {
      id: '1',
      name: 'Admin',
      role: 'admin'
    },
    {
      id: '2',
      name: 'Chef',
      role: 'kitchen'
    },
    {
      id: '3',
      name: 'Waiter',
      role: 'waiter'
    }
  ];
};

export const generateMockTables = (): Table[] => {
  const tables: Table[] = [];
  
  for (let i = 1; i <= 12; i++) {
    const tableId = uuidv4();
    tables.push({
      id: tableId,
      number: i,
      capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
      status: i % 5 === 0 ? 'occupied' : i % 7 === 0 ? 'reserved' : 'available',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=table-${i}`
    });
  }
  
  return tables;
};

export const generateMockModifiers = (): Modifier[] => {
  return [
    {
      id: uuidv4(),
      name: 'Spice Level',
      options: [
        { id: uuidv4(), name: 'Mild', price: 0 },
        { id: uuidv4(), name: 'Medium', price: 0 },
        { id: uuidv4(), name: 'Hot', price: 0 },
        { id: uuidv4(), name: 'Extra Hot', price: 0.5 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: uuidv4(),
      name: 'Toppings',
      options: [
        { id: uuidv4(), name: 'Cheese', price: 1 },
        { id: uuidv4(), name: 'Mushrooms', price: 1.5 },
        { id: uuidv4(), name: 'Peppers', price: 1 },
        { id: uuidv4(), name: 'Onions', price: 0.75 }
      ],
      required: false,
      multiSelect: true
    },
    {
      id: uuidv4(),
      name: 'Size',
      options: [
        { id: uuidv4(), name: 'Small', price: -2 },
        { id: uuidv4(), name: 'Regular', price: 0 },
        { id: uuidv4(), name: 'Large', price: 3 }
      ],
      required: true,
      multiSelect: false
    }
  ];
};

export const generateMockMenuItems = (): MenuItem[] => {
  const modifiers = generateMockModifiers();
  
  return [
    {
      id: uuidv4(),
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      price: 12.99,
      category: 'pizza',
      image: 'https://images.pexels.com/photos/3944311/pexels-photo-3944311.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 15,
      customizable: true,
      modifiers: [modifiers[1], modifiers[2]]
    },
    {
      id: uuidv4(),
      name: 'Pepperoni Pizza',
      description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
      price: 14.99,
      category: 'pizza',
      image: 'https://images.pexels.com/photos/2619970/pexels-photo-2619970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 15,
      customizable: true,
      modifiers: [modifiers[1], modifiers[2]]
    },
    {
      id: uuidv4(),
      name: 'Veggie Pizza',
      description: 'Pizza with tomato sauce, mozzarella, and assorted vegetables',
      price: 13.99,
      category: 'pizza',
      image: 'https://images.pexels.com/photos/2180875/pexels-photo-2180875.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: false,
      preparationTime: 15,
      customizable: true,
      modifiers: [modifiers[1], modifiers[2]]
    },
    {
      id: uuidv4(),
      name: 'Caesar Salad',
      description: 'Romaine lettuce, croutons, parmesan cheese with Caesar dressing',
      price: 8.99,
      category: 'salad',
      image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 5,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Greek Salad',
      description: 'Mixed greens, tomatoes, cucumbers, olives, feta cheese with vinaigrette',
      price: 9.99,
      category: 'salad',
      image: 'https://images.pexels.com/photos/16982655/pexels-photo-16982655/free-photo-of-a-plate-of-greek-salad.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 5,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Spaghetti Bolognese',
      description: 'Spaghetti with hearty meat sauce',
      price: 15.99,
      category: 'pasta',
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 20,
      customizable: true,
      modifiers: [modifiers[0]]
    },
    {
      id: uuidv4(),
      name: 'Fettuccine Alfredo',
      description: 'Fettuccine pasta with creamy parmesan sauce',
      price: 14.99,
      category: 'pasta',
      image: 'https://images.pexels.com/photos/5710170/pexels-photo-5710170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 18,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
      price: 7.99,
      category: 'dessert',
      image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 0,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Cheesecake',
      description: 'Creamy cheesecake with berry compote',
      price: 6.99,
      category: 'dessert',
      image: 'https://images.pexels.com/photos/4553123/pexels-photo-4553123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 0,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Coca-Cola',
      description: 'Classic cola beverage',
      price: 2.99,
      category: 'drinks',
      image: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 0,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Iced Tea',
      description: 'Refreshing iced tea with lemon',
      price: 2.99,
      category: 'drinks',
      image: 'https://images.pexels.com/photos/1194030/pexels-photo-1194030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 0,
      customizable: false
    },
    {
      id: uuidv4(),
      name: 'Fresh Lemonade',
      description: 'Housemade lemonade with fresh lemons',
      price: 3.99,
      category: 'drinks',
      image: 'https://images.pexels.com/photos/357573/pexels-photo-357573.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      available: true,
      preparationTime: 3,
      customizable: false
    }
  ];
};

export const generateMockCategories = (): MenuCategory[] => {
  const menuItems = generateMockMenuItems();
  
  const categories = [
    { id: uuidv4(), name: 'Pizza', items: [] },
    { id: uuidv4(), name: 'Pasta', items: [] },
    { id: uuidv4(), name: 'Salad', items: [] },
    { id: uuidv4(), name: 'Dessert', items: [] },
    { id: uuidv4(), name: 'Drinks', items: [] }
  ];
  
  // Assign items to categories
  menuItems.forEach(item => {
    if (item.category === 'pizza') {
      categories[0].items.push(item);
    } else if (item.category === 'pasta') {
      categories[1].items.push(item);
    } else if (item.category === 'salad') {
      categories[2].items.push(item);
    } else if (item.category === 'dessert') {
      categories[3].items.push(item);
    } else if (item.category === 'drinks') {
      categories[4].items.push(item);
    }
  });
  
  return categories;
};