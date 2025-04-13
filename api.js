import axios from 'axios';

export const getAlarmSummary = () => axios.get('http://localhost:3000/api/alarms/summary');
export const getRawAlarms = () => axios.get('http://localhost:3000/api/alarms/raw');
