import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { OrderStatus } from '../../types/order';

interface OrderTimerProps {
  orderId: string;
  orderStatus: OrderStatus;
  createdAt: Date;
  // Estimated preparation time in minutes
  estimatedTime?: number;
}

const OrderTimer = ({
  orderId,
  orderStatus,
  createdAt,
  estimatedTime = 15, // Default 15 minutes for food preparation
}: OrderTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Only show timer for pending and preparing orders
    if (!['pending', 'preparing'].includes(orderStatus)) {
      if (orderStatus === 'ready') {
        setMessage('Your food is ready!');
      } else if (orderStatus === 'served') {
        setMessage('Enjoy your meal!');
      } else if (orderStatus === 'completed') {
        setMessage('Thank you for dining with us!');
      } else if (orderStatus === 'cancelled') {
        setMessage('Order was cancelled');
      }
      return;
    }

    // Calculate initial time remaining
    const orderTime = new Date(createdAt).getTime();
    const estimatedCompletionTime = orderTime + estimatedTime * 60 * 1000;
    const initialTimeRemaining = Math.max(
      0,
      Math.floor((estimatedCompletionTime - Date.now()) / 1000)
    );

    setTimeRemaining(initialTimeRemaining);
    setIsExpired(initialTimeRemaining <= 0);

    if (initialTimeRemaining <= 0) {
      setMessage('Your food should be ready soon!');
    } else {
      setMessage(
        orderStatus === 'pending' 
          ? 'Order received, preparing soon...' 
          : 'Your food is being prepared...'
      );
    }

    // Set up interval to update timer
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          setIsExpired(true);
          setMessage('Your food should be ready soon!');
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [orderStatus, createdAt, estimatedTime]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Don't render anything for completed or cancelled orders
  if (['completed', 'cancelled'].includes(orderStatus)) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex items-center text-sm">
        <Clock size={16} className="mr-1 text-gray-500" />
        <span className="text-gray-700">{message}</span>
      </div>
      
      {!isExpired && ['pending', 'preparing'].includes(orderStatus) && (
        <div className="mt-1">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${orderStatus === 'pending' ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{
                width: `${Math.min(
                  100,
                  100 - (timeRemaining / (estimatedTime * 60)) * 100
                )}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Estimated time: {formatTimeRemaining()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimer;