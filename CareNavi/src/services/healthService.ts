import {Platform} from 'react-native';
import type {IHealthService} from '../types/health';

// Platform-specific imports
let healthService: IHealthService;

if (Platform.OS === 'ios') {
  healthService = require('./healthService.ios').healthService;
} else {
  healthService = require('./healthService.android').healthService;
}

export {healthService};
export default healthService;
