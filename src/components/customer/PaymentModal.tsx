import { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import { CreditCard, Check, DollarSign, Receipt, Users } from 'lucide-react';

interface PaymentModalProps {
  orderId: string;
  onClose: () => void;
}

const PaymentModal = ({ orderId, onClose }: PaymentModalProps) => {
  const { getOrderById, completeOrder } = useOrder();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [splitBill, setSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  
  const order = getOrderById(orderId);
  
  if (!order) {
    return null;
  }
  
  const totalAmount = order.totalAmount;
  const splitAmount = splitBill ? totalAmount / splitCount : totalAmount;
  
  const handlePayment = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      completeOrder(orderId, {
        amount: totalAmount,
        splitBill
      });
      
      setProcessing(false);
      setComplete(true);
      
      // Close modal after showing success
      setTimeout(onClose, 2000);
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {complete ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Complete!</h3>
            <p className="text-gray-600">Thank you for your order.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Payment</h3>
              <p className="text-gray-600 mt-1">Complete your order payment</p>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    {order.items.length > 3 && (
                      <div className="text-gray-500 text-sm">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-semibold text-lg">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Split Bill</h4>
                <div className="flex items-center mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={splitBill}
                      onChange={() => setSplitBill(!splitBill)}
                      className="mr-2"
                    />
                    <span>Split payment between multiple people</span>
                  </label>
                </div>
                
                {splitBill && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label htmlFor="splitCount" className="text-blue-800">Number of people:</label>
                      <select
                        id="splitCount"
                        value={splitCount}
                        onChange={(e) => setSplitCount(parseInt(e.target.value))}
                        className="p-1 border border-blue-300 rounded bg-white"
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-blue-800">
                        <Users size={16} className="mr-1" />
                        Amount per person:
                      </span>
                      <span className="font-semibold">${splitAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Payment Method</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } flex flex-col items-center justify-center`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-blue-500' : 'text-gray-600'} />
                    <span className={`mt-2 ${paymentMethod === 'card' ? 'text-blue-700' : 'text-gray-800'}`}>Card</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-lg border ${
                      paymentMethod === 'cash' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } flex flex-col items-center justify-center`}
                  >
                    <DollarSign size={24} className={paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-600'} />
                    <span className={`mt-2 ${paymentMethod === 'cash' ? 'text-blue-700' : 'text-gray-800'}`}>Cash</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center">
                <Receipt size={20} className="text-gray-600 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  You'll earn <span className="font-semibold">{Math.floor(totalAmount / 10)}</span> loyalty points with this purchase
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between gap-3">
              <button
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              
              <button
                onClick={handlePayment}
                disabled={processing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${splitBill ? splitAmount.toFixed(2) : totalAmount.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;