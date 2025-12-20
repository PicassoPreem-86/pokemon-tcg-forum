// Types for auth actions - separate file because 'use server' files can only export async functions

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  location?: string;
  signature?: string;
  avatarUrl?: string;
}
