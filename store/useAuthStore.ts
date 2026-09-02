import { create } from 'zustand';
import { User } from '../types/tourism';
import { loginUser as loginApi, registerUser as registerApi, RegisterUserDto, LoginUserDto } from '../lib/api/users';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginUserDto) => Promise<void>;
  register: (dto: RegisterUserDto) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginApi(dto);
      set({ user, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },
  register: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const user = await registerApi(dto);
      set({ user, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },
  logout: () => set({ user: null }),
  setUser: (user) => set({ user })
}));
