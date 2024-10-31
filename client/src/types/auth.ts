export interface User {
  id: number;
  email: string;
  name: string;
  googleId: string;
  avatarUrl: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (response: any) => Promise<void>;
  logout: () => void;
}
