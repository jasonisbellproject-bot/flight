import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`,
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

export const generateReceipt = async (data: any) => {
  const response = await api.post('/documents/receipt', data);
  return response.data;
};

export default api;
