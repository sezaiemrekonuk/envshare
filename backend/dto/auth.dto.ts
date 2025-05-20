import { z } from 'zod';

// Register DTO schema validation
export const RegisterDtoSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

// Login DTO schema validation
export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

// Refresh token DTO schema validation
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string()
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

// Response DTOs
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
} 