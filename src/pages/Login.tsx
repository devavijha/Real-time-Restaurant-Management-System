import { useState } from 'react';
import { UserRole } from '../types/auth';
import { ChefHat, ClipboardList, QrCode, UserCog } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, tableId?: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tableId, setTableId] = useState('');
  const [isQRScanning, setIsQRScanning] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === 'customer') {
      onLogin('customer', tableId);
    } else if (selectedRole) {
      onLogin(selectedRole);
    }
  };

  const simulateQRScan = () => {
    setIsQRScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsQRScanning(false);
      setTableId('table-1');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Management</h1>
          <p className="text-gray-600 mt-2">Please select your role to continue</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleRoleSelect('customer')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              selectedRole === 'customer' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <QrCode size={24} className="mb-2" />
            <span>Customer</span>
          </button>
          
          <button
            onClick={() => handleRoleSelect('waiter')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              selectedRole === 'waiter' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList size={24} className="mb-2" />
            <span>Waiter</span>
          </button>
          
          <button
            onClick={() => handleRoleSelect('kitchen')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              selectedRole === 'kitchen' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChefHat size={24} className="mb-2" />
            <span>Kitchen</span>
          </button>
          
          <button
            onClick={() => handleRoleSelect('admin')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              selectedRole === 'admin' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCog size={24} className="mb-2" />
            <span>Admin</span>
          </button>
        </div>

        {selectedRole && (
          <form onSubmit={handleSubmit}>
            {selectedRole === 'customer' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-700 mb-2">Please scan your table's QR code or enter table ID</p>
                  
                  {tableId ? (
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                      Table ID: {tableId}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={simulateQRScan}
                      disabled={isQRScanning}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
                    >
                      {isQRScanning ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <QrCode size={20} className="mr-2" />
                          Scan QR Code
                        </span>
                      )}
                    </button>
                  )}
                  
                  <div className="mt-4 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or enter manually</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Enter Table ID"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={selectedRole === 'admin' ? 'Admin' : selectedRole === 'kitchen' ? 'Chef' : 'Waiter'}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="For demo, any password works"
                  />
                </div>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={selectedRole === 'customer' && !tableId}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Continue
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a demo application. For testing purposes, any login credentials will work.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;