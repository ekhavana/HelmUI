import { create } from 'zustand';
import { mockBoatData, type BoatData } from '../data/mockBoatData';

interface BoatStore {
  data: BoatData;
  setBoatData: (data: BoatData) => void;
}

export const useBoatStore = create<BoatStore>((set) => ({
  data: mockBoatData,
  setBoatData: (data) => set({ data }),
}));
