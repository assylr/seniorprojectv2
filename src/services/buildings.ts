import { Building } from '../types/Buildings'
import { api } from './api'

export const getBuildings = async (): Promise<Building[]> => {
  const { data } = await api.get('/buildings');
  return data;
};
