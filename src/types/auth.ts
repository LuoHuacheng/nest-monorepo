export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    status: number;
    roles?: string[];
  };
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  status: number;
  roles?: string[];
}
