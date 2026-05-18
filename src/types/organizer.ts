export interface Organizer {
  id: string;
  loginAccount: string;
  name: string;
  contact: string;
  phone: string;
  backupContact: string;
  backupPhone: string;
  certificateNo: string;
  eventDate: string;
  province: string;
  city: string;
  address: string;
  eventScale: number;
  eventItems: string[];
  operator?: string;
  email: string;
  remark?: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AthleticCenter {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
}
