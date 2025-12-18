import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
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

class HealthServiceAndroid implements IHealthService {
  private initialized = false;

  async isAvailable(): Promise<boolean> {
    try {
      const status = await getSdkStatus();
      return status === SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<HealthServiceResult<HealthPermissions>> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Health Connect가 이 기기에서 사용할 수 없습니다',
        };
      }

      const isInitialized = await initialize();
      if (!isInitialized) {
        return {success: false, error: 'Health Connect 초기화 실패'};
      }

      const permissions = await requestPermission([
        {accessType: 'read', recordType: 'Steps'},
        {accessType: 'read', recordType: 'SleepSession'},
      ]);

      this.initialized = true;

      const hasSteps = permissions.some(
        p => p.recordType === 'Steps' && p.accessType === 'read',
      );
      const hasSleep = permissions.some(
        p => p.recordType === 'SleepSession' && p.accessType === 'read',
      );

      return {
        success: true,
        data: {
          steps: hasSteps ? 'granted' : 'denied',
          sleep: hasSleep ? 'granted' : 'denied',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
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
    const result = await this.getStepsForDate(new Date());
    return result.success
      ? {success: true, data: result.data?.count ?? 0}
      : result;
  }

  async getStepsForDate(date: Date): Promise<HealthServiceResult<StepData>> {
    if (!this.initialized) {
      return {success: false, error: 'Health Connect가 초기화되지 않았습니다'};
    }

    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      const totalSteps = result.records.reduce(
        (sum, record: any) => sum + (record.count || 0),
        0,
      );

      return {
        success: true,
        data: {
          count: totalSteps,
          date: formatDate(date),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  async getWeeklySteps(
    endDate: Date = new Date(),
  ): Promise<HealthServiceResult<StepData[]>> {
    if (!this.initialized) {
      return {success: false, error: 'Health Connect가 초기화되지 않았습니다'};
    }

    try {
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDateTime.toISOString(),
        },
      });

      // Group by date
      const stepsByDate = new Map<string, number>();

      for (let i = 0; i <= 6; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        stepsByDate.set(formatDate(d), 0);
      }

      result.records.forEach((record: any) => {
        const recordDate = formatDate(new Date(record.startTime));
        const current = stepsByDate.get(recordDate) || 0;
        stepsByDate.set(recordDate, current + (record.count || 0));
      });

      const stepsData: StepData[] = Array.from(stepsByDate.entries()).map(
        ([date, count]) => ({date, count}),
      );

      return {success: true, data: stepsData};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
    }
  }

  async getTodaySleep(): Promise<HealthServiceResult<number>> {
    const result = await this.getSleepForDate(new Date());
    return result.success
      ? {success: true, data: result.data?.hours ?? 0}
      : result;
  }

  async getSleepForDate(date: Date): Promise<HealthServiceResult<SleepData>> {
    if (!this.initialized) {
      return {success: false, error: 'Health Connect가 초기화되지 않았습니다'};
    }

    try {
      // Sleep data typically spans across midnight
      const startTime = new Date(date);
      startTime.setDate(startTime.getDate() - 1);
      startTime.setHours(18, 0, 0, 0); // 6 PM previous day

      const endTime = new Date(date);
      endTime.setHours(14, 0, 0, 0); // 2 PM current day

      const result = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      let totalMinutes = 0;
      result.records.forEach((record: any) => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      });

      return {
        success: true,
        data: {
          hours: Math.round((totalMinutes / 60) * 10) / 10,
          date: formatDate(date),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      };
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

export const healthService = new HealthServiceAndroid();
export default healthService;
