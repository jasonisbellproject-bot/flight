import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`,
});

api.interceptors.request.use((config) => {
  const token = typeof window === 'undefined' ? null : getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Airport {
  id: number;
  iata_code: string;
  icao_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface ReceiptItem {
  name: string;
  price: string;
}

export interface ReceiptRequest {
  businessName: string;
  logoUrl?: string;
  date: string;
  items: ReceiptItem[];
  subtotal: string;
  tax: string;
  total: string;
}

export const searchAirports = async (query: string): Promise<Airport[]> => {
  const response = await api.get(`/airports?q=${query}`);
  return response.data;
};

export const generateItinerary = async (data: {
  passengerName: string;
  email: string;
  price: string;
  date: string;
  originId: number;
  destinationId: number;
}) => {
  const response = await api.post('/documents/itinerary', data);
  return response.data;
};

export const generateReceipt = async (data: ReceiptRequest) => {
  const response = await api.post('/documents/receipt', data);
  return response.data;
};

export interface IdCardRequest {
  name: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  photoUrl?: string;
  idNumber?: string;
}

export const generateIdCard = async (data: IdCardRequest) => {
  const response = await api.post('/documents/id_card', data);
  return response.data;
};

export default api;
