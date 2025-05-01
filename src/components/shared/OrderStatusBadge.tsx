import { OrderStatus } from '../../types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  small?: boolean;
}

const OrderStatusBadge = ({ status, small = false }: OrderStatusBadgeProps) => {
  let bgColor = '';
  let textColor = '';
  
  switch (status) {
    case 'pending':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'preparing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'ready':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'served':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'completed':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <span className={`${bgColor} ${textColor} ${
      small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
    } rounded-full font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default OrderStatusBadge;