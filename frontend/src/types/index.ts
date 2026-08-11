export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface CV {
  id: number;
  filename: string;
  original_filename: string;
  tier: string;
  file_size: number;
  uploaded_by: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Source {
  cv_id: number;
  filename: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}
