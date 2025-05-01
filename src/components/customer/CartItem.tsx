import { OrderItem, MenuItem } from '../../types/order';
import { X, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: OrderItem & { menuItem: MenuItem };
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.quantity + 1);
  };
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    }
  };
  
  // Calculate total price including modifiers
  let totalPrice = item.price * item.quantity;
  
  if (item.modifiers) {
    item.modifiers.forEach(modifier => {
      modifier.options.forEach(option => {
        totalPrice += option.price * item.quantity;
      });
    });
  }
  
  return (
    <div className="flex gap-3 border-b border-gray-100 pb-4">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={item.menuItem.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{item.name}</h4>
          <button 
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        
        {item.modifiers && item.modifiers.length > 0 && (
          <ul className="text-sm text-gray-500 mt-1">
            {item.modifiers.map((mod, idx) => (
              <li key={idx}>
                {mod.name}: {mod.options.map(opt => opt.name).join(', ')}
              </li>
            ))}
          </ul>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button 
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
            >
              <Minus size={14} />
            </button>
            <span className="px-2 text-sm text-gray-800">{item.quantity}</span>
            <button 
              onClick={handleIncrease}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <span className="font-semibold">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;