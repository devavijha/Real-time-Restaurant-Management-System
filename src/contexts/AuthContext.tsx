import { createContext, useState, useContext, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '../types/auth';
import { generateMockUsers } from '../services/mockData';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers = generateMockUsers();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (credentials: { 
    username: string; 
    password: string; 
    role: UserRole;
    tableId?: string
  }): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, any login is successful
        if (credentials.role === 'customer' && credentials.tableId) {
          setUser({
            id: `customer-${credentials.tableId}`,
            name: 'Customer',
            role: 'customer'
          });
        } else {
          // Find user in mock data or create a temporary one
          const foundUser = mockUsers.find(u => 
            u.name.toLowerCase() === credentials.username.toLowerCase() && 
            u.role === credentials.role
          );
          
          if (foundUser) {
            setUser(foundUser);
          } else {
            // For demo, create a user with the requested role
            setUser({
              id: `user-${Date.now()}`,
              name: credentials.username || 'User',
              role: credentials.role
            });
          }
        }
        resolve(true);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};