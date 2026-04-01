export interface LoginResponse {
  accessToken: string;
  expires_in: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
