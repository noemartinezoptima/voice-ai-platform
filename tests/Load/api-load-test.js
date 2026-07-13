import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiTrend = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    api_duration: ['p(95)<1500'],
  },
};

const BASE = __ENV.BASE_URL || 'http://voice-ai-platform.test';
const TOKEN = __ENV.API_TOKEN || '';

const params = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  },
};

export default function () {
  group('Calls API', () => {
    const start = __VU % 100;
    const res = http.get(`${BASE}/api/calls?per_page=20&page=1`, params);
    check(res, { 'calls status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
    sleep(0.5);
  });

  group('SMS API', () => {
    const res = http.get(`${BASE}/api/sms-messages?per_page=20&page=1`, params);
    check(res, { 'sms status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
    sleep(0.5);
  });

  group('Flows API', () => {
    const res = http.get(`${BASE}/api/flows?per_page=20`, params);
    check(res, { 'flows status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
    sleep(0.3);
  });

  group('Dashboard Stats', () => {
    const res = http.get(`${BASE}/api/stats/dashboard`, params);
    check(res, { 'stats status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
    sleep(1);
  });

  group('Health Check', () => {
    const res = http.get(`${BASE}/api/health`, params);
    check(res, { 'health status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.1);
  });
}
