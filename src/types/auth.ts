export type UserRole = 'customer' | 'admin' | 'kitchen' | 'waiter';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string; role: UserRole; tableId?: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}