// User Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  noHp: string;
  isMahasiswa: boolean;
  isAdmin: boolean;
  nik: string;
  pj?: string;
  createdAt: string;
  updatedAt: string;
}

// Container Types
export interface Container {
  id: number;
  name: string;
  imageName: string;
  sshPort: number;
  jupyterPort: number;
  password: string;
  CPU: number;
  RAM: string;
  GPU: string;
  userId: number;
  status?: string; // 'running', 'stopped', 'exited', etc.
  user?: User;
}

// Payment Types
export interface Payment {
  id: number;
  paketId: number;
  status: number; // 0: pending admin confirmation, 1: confirmed
  harga: number;
  userId: number;
  tujuanPenelitian: string;
  user?: User;
  paket?: Paket;
}

// Paket Types
export interface Paket {
  id: number;
  name: string;
  CPU: number;
  RAM: number;
  GPU: number;
  harga: number;
  durasi: number;
}

// Tiket Types
export interface Tiket {
  id: number;
  deskripsi: string;
  status: string;
  containerId: number;
  container?: Container;
}

// GPU Types
export interface GPU {
  id: number;
  name: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  noHp: string;
  isMahasiswa: boolean;
  pj?: string;
  nik: string;
}

export interface AuthResponse {
  data: {
    token?: string;
    fullName?: string;
  };
  meta: {
    code: number;
    message: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta: {
    code: number;
    message: string;
  };
}

// Container Stats
export interface ContainerStats {
  Container: string;
  Name: string;
  CPUPerc: string;
  MemUsage: string;
  MemPerc: string;
  NetIO: string;
  BlockIO: string;
  PIDs: string;
}

// Docker Image Search Result
export interface DockerImage {
  name: string;
  description: string;
  stars: string;
  official: string;
}
