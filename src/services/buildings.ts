import { Building } from '../types/buildings'
import { api } from './api'

export const getBuildings = async (): Promise<Building[]> => {
  const { data } = await api.get('/buildings');
  return data;
};
