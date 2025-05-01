import { useState } from 'react';
import { MenuItem, Modifier } from '../../types/restaurant';
import { Plus, Minus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, modifiers?: any[]) => void;
}

const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  
  const handleOpenModal = () => {
    if (!item.customizable) {
      // If item is not customizable, add directly to cart
      onAddToCart(item, quantity);
      return;
    }
    
    // Initialize selected modifiers
    const initialModifiers: Record<string, string[]> = {};
    item.modifiers?.forEach(modifier => {
      initialModifiers[modifier.id] = modifier.required ? [modifier.options[0].id] : [];
    });
    
    setSelectedModifiers(initialModifiers);
    setIsModalOpen(true);
  };
  
  const handleModifierChange = (modifierId: string, optionId: string, multiSelect: boolean) => {
    setSelectedModifiers(prev => {
      const updated = { ...prev };
      
      if (multiSelect) {
        // For multi-select, toggle the option
        const currentSelections = [...(updated[modifierId] || [])];
        const index = currentSelections.indexOf(optionId);
        
        if (index >= 0) {
          currentSelections.splice(index, 1);
        } else {
          currentSelections.push(optionId);
        }
        
        updated[modifierId] = currentSelections;
      } else {
        // For single-select, replace the selection
        updated[modifierId] = [optionId];
      }
      
      return updated;
    });
  };
  
  const handleAddToCartWithModifiers = () => {
    // Format modifiers for cart
    const modifiers = item.modifiers?.map(modifier => {
      const selectedOptionIds = selectedModifiers[modifier.id] || [];
      const options = modifier.options
        .filter(option => selectedOptionIds.includes(option.id))
        .map(option => ({
          name: option.name,
          price: option.price
        }));
      
      return {
        name: modifier.name,
        options
      };
    });
    
    onAddToCart(item, quantity, modifiers);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm overflow-hidden transition-opacity ${
        !item.available ? 'opacity-60' : ''
      }`}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium text-lg">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-800">{item.name}</h3>
            <span className="font-semibold">${item.price.toFixed(2)}</span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Minus size={16} />
              </button>
              <span className="px-2 text-gray-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button
              onClick={handleOpenModal}
              disabled={!item.available}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg text-sm"
            >
              Add to Order
            </button>
          </div>
        </div>
      </div>
      
      {/* Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            
            <div className="p-4 space-y-6">
              {item.modifiers?.map(modifier => (
                <ModifierSection 
                  key={modifier.id}
                  modifier={modifier}
                  selectedOptions={selectedModifiers[modifier.id] || []}
                  onChange={handleModifierChange}
                />
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddToCartWithModifiers}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface ModifierSectionProps {
  modifier: Modifier;
  selectedOptions: string[];
  onChange: (modifierId: string, optionId: string, multiSelect: boolean) => void;
}

const ModifierSection = ({ modifier, selectedOptions, onChange }: ModifierSectionProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-800">{modifier.name}</h4>
        {modifier.required && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
        )}
      </div>
      
      <div className="space-y-2">
        {modifier.options.map(option => (
          <label 
            key={option.id}
            className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center">
              <input
                type={modifier.multiSelect ? 'checkbox' : 'radio'}
                checked={selectedOptions.includes(option.id)}
                onChange={() => onChange(modifier.id, option.id, modifier.multiSelect)}
                className="mr-3"
              />
              <span>{option.name}</span>
            </div>
            
            {option.price !== 0 && (
              <span className="text-sm text-gray-600">
                {option.price > 0 ? `+$${option.price.toFixed(2)}` : `-$${Math.abs(option.price).toFixed(2)}`}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default MenuItemCard;