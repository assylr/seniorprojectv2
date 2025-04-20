import { Room } from '../types/rooms'
import { api } from './api'

export const getRooms = async (): Promise<Room[]> => {
  const { data } = await api.get('/rooms');
  return data;
};
