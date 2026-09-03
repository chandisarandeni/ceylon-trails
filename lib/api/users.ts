import { apiFetch } from './client';
import { User } from '../../types/tourism';

// Matches backend CreateUserDto exactly — all fields required
export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string; // ISO 8601 date string e.g. "1995-01-01"
  country: string;
}

// Matches backend LoginUserDto exactly
export interface LoginUserDto {
  email: string;
  password: string;
}

// POST /users returns UserResponse directly (no wrapper)
// POST /users/login returns { message, user: UserResponse }
interface LoginResponse {
  message: string;
  user: User;
}

/**
 * POST /users — Register a new user account.
 * Backend CreateUserDto: { firstName, lastName, email, phone, password (min 8), dateOfBirth (ISO), country }
 * Returns: UserResponse directly (NOT wrapped in { user })
 */
export async function registerUser(dto: RegisterUserDto): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      password: dto.password,
      dateOfBirth: dto.dateOfBirth,
      country: dto.country.trim()
    })
  });
}

/**
 * POST /users/login — Login an existing user.
 * Backend LoginUserDto: { email, password (min 8) }
 * Returns: { message, user: UserResponse }
 */
export async function loginUser(dto: LoginUserDto): Promise<User> {
  const response = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({
      email: dto.email.trim().toLowerCase(),
      password: dto.password
    })
  });
  return response.user;
}

/**
 * PATCH /users/:id — Update an existing user.
 * Backend UpdateUserDto: Partial<CreateUserDto>
 */
export async function updateUser(id: string, dto: Partial<RegisterUserDto>): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto)
  });
}

/**
 * DELETE /users/:id — Delete a user account.
 */
export async function deleteUser(id: string): Promise<{ message: string; user: User }> {
  return apiFetch<{ message: string; user: User }>(`/users/${id}`, {
    method: 'DELETE'
  });
}
