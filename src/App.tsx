import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { OrderProvider } from './contexts/OrderContext';
import Login from './pages/Login';
import CustomerView from './pages/CustomerView';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import { UserRole } from './types/auth';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  const handleLogin = (userRole: UserRole, table?: string) => {
    setLoggedIn(true);
    setRole(userRole);
    if (table) setTableId(table);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setRole(null);
    setTableId(null);
  };

  return (
    <AuthProvider>
      <RestaurantProvider>
        <OrderProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            {!loggedIn ? (
              <Login onLogin={handleLogin} />
            ) : (
              <>
                {role === 'customer' && tableId && (
                  <CustomerView tableId={tableId} onLogout={handleLogout} />
                )}
                {role === 'admin' && (
                  <AdminDashboard onLogout={handleLogout} />
                )}
                {role === 'kitchen' && (
                  <KitchenDashboard onLogout={handleLogout} />
                )}
                {role === 'waiter' && (
                  <WaiterDashboard onLogout={handleLogout} />
                )}
              </>
            )}
          </div>
        </OrderProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;