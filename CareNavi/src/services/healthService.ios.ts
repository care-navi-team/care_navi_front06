import Healthkit from '@kingstinct/react-native-healthkit';
import {
  StepData,
  SleepData,
  WeeklyHealthData,
  DailyHealthSummary,
  HealthPermissions,
  HealthServiceResult,
  IHealthService,
} from '../types/health';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// HealthKit type identifiers as string literals
const STEP_COUNT = 'HKQuantityTypeIdentifierStepCount';
const SLEEP_ANALYSIS = 'HKCategoryTypeIdentifierSleepAnalysis';

class HealthServiceIOS implements IHealthService {
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      const available = Healthkit.isHealthDataAvailable();
      console.log('[HealthKit.ios] isAvailable:', available);
      return available;
    } catch (error) {
      console.log('[HealthKit.ios] isAvailable error:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<HealthServiceResult<HealthPermissions>> {
    try {
      console.log('[HealthKit.ios] Requesting permissions...');

      await Healthkit.requestAuthorization({
        toRead: [STEP_COUNT, SLEEP_ANALYSIS],
      });

      this.initialized = true;
      console.log('[HealthKit.ios] Permissions granted');

      return {
        success: true,
        data: {
          steps: 'granted',
          sleep: 'granted',
        },
      };
    } catch (error: any) {
      console.log('[HealthKit.ios] Permission error:', error);
      return {
        success: false,
        error: 'HealthKit 권한 요청 실패: ' + error.message,
      };
    }
  }

  async checkPermissions(): Promise<HealthPermissions> {
    return {
      steps: this.initialized ? 'granted' : 'not_determined',
      sleep: this.initialized ? 'granted' : 'not_determined',
    };
  }

  async getTodaySteps(): Promise<HealthServiceResult<number>> {
    if (!this.initialized) {
      return {success: false, error: 'HealthKit이 초기화되지 않았습니다'};
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      console.log('[HealthKit.ios] getTodaySteps - from:', today.toISOString(), 'to:', now.toISOString());

      const result = await Healthkit.queryStatisticsForQuantity(
        STEP_COUNT as any,
        ['cumulativeSum'],
        {
          filter: {
            date: {
              startDate: today,
              endDate: now,
            },
          },
        }
      );

      console.log('[HealthKit.ios] getTodaySteps result:', JSON.stringify(result, null, 2));

      const steps = result?.sumQuantity?.quantity ?? 0;
      console.log('[HealthKit.ios] getTodaySteps parsed steps:', steps);

      return {success: true, data: steps};
    } catch (error: any) {
      console.log('[HealthKit.ios] getTodaySteps error:', error);
      return {success: false, error: error.message};
    }
  }

  async getStepsForDate(date: Date): Promise<HealthServiceResult<StepData>> {
    if (!this.initialized) {
      return {success: false, error: 'HealthKit이 초기화되지 않았습니다'};
    }

    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const result = await Healthkit.queryStatisticsForQuantity(
        STEP_COUNT as any,
        ['cumulativeSum'],
        {
          filter: {
            date: {
              startDate: startDate,
              endDate: endDate,
            },
          },
        }
      );

      return {
        success: true,
        data: {
          count: result?.sumQuantity?.quantity ?? 0,
          date: formatDate(date),
        },
      };
    } catch (error: any) {
      console.log('[HealthKit.ios] getStepsForDate error:', error);
      return {success: false, error: error.message};
    }
  }

  async getWeeklySteps(
    endDate: Date = new Date(),
  ): Promise<HealthServiceResult<StepData[]>> {
    if (!this.initialized) {
      return {success: false, error: 'HealthKit이 초기화되지 않았습니다'};
    }

    try {
      const stepsData: StepData[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const result = await this.getStepsForDate(date);
        if (result.success && result.data) {
          stepsData.push(result.data);
        } else {
          stepsData.push({count: 0, date: formatDate(date)});
        }
      }

      return {success: true, data: stepsData};
    } catch (error: any) {
      console.log('[HealthKit.ios] getWeeklySteps error:', error);
      return {success: false, error: error.message};
    }
  }

  async getTodaySleep(): Promise<HealthServiceResult<number>> {
    const result = await this.getSleepForDate(new Date());
    if (result.success && result.data) {
      return {success: true, data: result.data.hours};
    }
    return {success: false, error: result.error};
  }

  async getSleepForDate(date: Date): Promise<HealthServiceResult<SleepData>> {
    if (!this.initialized) {
      return {success: false, error: 'HealthKit이 초기화되지 않았습니다'};
    }

    try {
      // Sleep typically spans midnight, so check from previous evening
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(18, 0, 0, 0); // 6 PM previous day

      const endDate = new Date(date);
      endDate.setHours(14, 0, 0, 0); // 2 PM current day

      console.log('[HealthKit.ios] getSleepForDate - from:', startDate.toISOString(), 'to:', endDate.toISOString());

      const samples = await Healthkit.queryCategorySamples(
        SLEEP_ANALYSIS as any,
        {
          limit: -1, // -1 means no limit
          ascending: false,
          filter: {
            date: {
              startDate: startDate,
              endDate: endDate,
            },
          },
        }
      );

      // Calculate total sleep hours from samples
      let totalMinutes = 0;
      samples?.forEach((sample: any) => {
        // Count all sleep states including InBed (value: 0)
        // HKCategoryValueSleepAnalysis values:
        // 0 = InBed, 1 = AsleepUnspecified, 2 = Awake, 3 = AsleepCore, 4 = AsleepDeep, 5 = AsleepREM
        // We count everything except Awake (2)
        const isAwake = sample.value === 2 ||
          sample.value === 'HKCategoryValueSleepAnalysisAwake';

        if (!isAwake) {
          const start = new Date(sample.startDate);
          const end = new Date(sample.endDate);
          const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
          console.log(`[HealthKit.ios] Sleep sample: value=${sample.value}, ${minutes.toFixed(0)} mins`);
          totalMinutes += minutes;
        }
      });

      return {
        success: true,
        data: {
          hours: Math.round((totalMinutes / 60) * 10) / 10,
          date: formatDate(date),
        },
      };
    } catch (error: any) {
      console.log('[HealthKit.ios] getSleepForDate error:', error);
      return {success: false, error: error.message};
    }
  }

  async getWeeklySleep(
    endDate: Date = new Date(),
  ): Promise<HealthServiceResult<SleepData[]>> {
    const sleepData: SleepData[] = [];
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    for (let i = 0; i <= 6; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const result = await this.getSleepForDate(date);
      if (result.success && result.data) {
        sleepData.push(result.data);
      } else {
        sleepData.push({hours: 0, date: formatDate(date)});
      }
    }

    return {success: true, data: sleepData};
  }

  async getWeeklyHealthData(
    endDate: Date = new Date(),
  ): Promise<HealthServiceResult<WeeklyHealthData>> {
    const [stepsResult, sleepResult] = await Promise.all([
      this.getWeeklySteps(endDate),
      this.getWeeklySleep(endDate),
    ]);

    if (!stepsResult.success || !sleepResult.success) {
      return {
        success: false,
        error: stepsResult.error || sleepResult.error,
      };
    }

    const steps = stepsResult.data!;
    const sleep = sleepResult.data!;
    const totalSteps = steps.reduce((sum, s) => sum + s.count, 0);
    const validSleep = sleep.filter(s => s.hours > 0);
    const averageSleep =
      validSleep.length > 0
        ? validSleep.reduce((sum, s) => sum + s.hours, 0) / validSleep.length
        : 0;

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    return {
      success: true,
      data: {
        steps,
        sleep,
        totalSteps,
        averageSleep: Math.round(averageSleep * 10) / 10,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
    };
  }

  async getDailyHealthSummary(
    date: Date = new Date(),
  ): Promise<HealthServiceResult<DailyHealthSummary>> {
    const [stepsResult, sleepResult] = await Promise.all([
      this.getStepsForDate(date),
      this.getSleepForDate(date),
    ]);

    return {
      success: true,
      data: {
        steps: stepsResult.data?.count ?? 0,
        sleepHours: sleepResult.data?.hours ?? 0,
        date: formatDate(date),
      },
    };
  }
}

export const healthService = new HealthServiceIOS();
export default healthService;
