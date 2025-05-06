import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Order, OrderStatus } from '../../types/order';

interface OrderNotificationProps {
  order: Order;
  previousStatus?: OrderStatus;
}

const OrderNotification = ({ order, previousStatus }: OrderNotificationProps) => {
  useEffect(() => {
    // Only show notifications when status changes
    if (previousStatus && previousStatus !== order.status) {
      switch (order.status) {
        case 'pending':
          toast('Your order has been received!', {
            icon: '🧾',
            duration: 3000,
          });
          break;
        case 'preparing':
          toast('The kitchen is now preparing your food!', {
            icon: '👨‍🍳',
            duration: 3000,
          });
          break;
        case 'ready':
          toast('Your food is ready! It will be served shortly.', {
            icon: '🍽️',
            duration: 4000,
          });
          break;
        case 'served':
          toast('Your food has been served. Enjoy your meal!', {
            icon: '😋',
            duration: 3000,
          });
          break;
        case 'completed':
          toast('Thank you for dining with us!', {
            icon: '👍',
            duration: 3000,
          });
          break;
        case 'cancelled':
          toast('Your order has been cancelled.', {
            icon: '❌',
            duration: 3000,
          });
          break;
        default:
          break;
      }
    }
  }, [order.status, previousStatus]);

  // This is a notification component that doesn't render anything visible
  return null;
};

export default OrderNotification;