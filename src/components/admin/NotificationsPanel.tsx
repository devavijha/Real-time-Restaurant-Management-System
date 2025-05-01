import { Bell, Check } from 'lucide-react';

interface NotificationsPanelProps {
  notifications: {id: string; message: string; time: Date}[];
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel = ({ notifications, onClearNotification, onClearAll }: NotificationsPanelProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800 flex items-center">
            <Bell size={20} className="mr-2 text-blue-500" />
            Notifications
          </h3>
          <button 
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No notifications at this time</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <li key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button 
                      onClick={() => onClearNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClearAll}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;