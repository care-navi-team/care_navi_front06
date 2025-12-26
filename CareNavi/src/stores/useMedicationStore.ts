// Medication tracking store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MedicationRecord {
  date: string; // YYYY-MM-DD
  morning: boolean;
  evening: boolean;
}

interface MedicationState {
  records: MedicationRecord[];

  // Actions
  getMedicationForDate: (date: string) => MedicationRecord | undefined;
  getTodayMedication: () => MedicationRecord;
  getWeeklyMedication: () => { data: boolean[][]; compliance: number };
  takeMedication: (time: 'morning' | 'evening') => void;
  getTodayCompletedCount: () => number;
}

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const getWeekDates = (): string[] => {
  const dates: string[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(getDateString(date));
  }
  return dates;
};

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      records: [],

      getMedicationForDate: (date: string) => {
        return get().records.find(r => r.date === date);
      },

      getTodayMedication: () => {
        const today = getDateString();
        const record = get().records.find(r => r.date === today);
        return record || { date: today, morning: false, evening: false };
      },

      getWeeklyMedication: () => {
        const weekDates = getWeekDates();
        const records = get().records;

        const data: boolean[][] = weekDates.map(date => {
          const record = records.find(r => r.date === date);
          if (record) {
            return [record.morning, record.evening];
          }
          return [false, false];
        });

        // Calculate compliance
        const totalPossible = weekDates.length * 2;
        const totalCompleted = data.reduce((sum, day) => {
          return sum + (day[0] ? 1 : 0) + (day[1] ? 1 : 0);
        }, 0);

        const compliance = Math.round((totalCompleted / totalPossible) * 100);

        return { data, compliance };
      },

      takeMedication: (time: 'morning' | 'evening') => {
        const today = getDateString();
        set(state => {
          const existingIndex = state.records.findIndex(r => r.date === today);

          if (existingIndex >= 0) {
            const updatedRecords = [...state.records];
            updatedRecords[existingIndex] = {
              ...updatedRecords[existingIndex],
              [time]: true,
            };
            return { records: updatedRecords };
          } else {
            return {
              records: [
                ...state.records,
                {
                  date: today,
                  morning: time === 'morning',
                  evening: time === 'evening',
                },
              ],
            };
          }
        });
      },

      getTodayCompletedCount: () => {
        const today = get().getTodayMedication();
        return (today.morning ? 1 : 0) + (today.evening ? 1 : 0);
      },
    }),
    {
      name: 'medication-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
