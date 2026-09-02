import { apiFetch } from './client';
import { User } from '../../types/tourism';

export interface RegisterUserDto {
  name: string;
  email: string;
  password?: string;
  country?: string;
}

export interface LoginUserDto {
  email: string;
  password?: string;
}

export async function registerUser(dto: RegisterUserDto): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function loginUser(dto: LoginUserDto): Promise<User> {
  return apiFetch<User>('/users/login', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function updateUser(id: string, dto: Partial<RegisterUserDto>): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto)
  });
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/users/${id}`, {
    method: 'DELETE'
  });
}
