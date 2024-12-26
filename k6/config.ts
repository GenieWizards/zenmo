export const BASE_URL = "http://localhost:8998";
export const API_VERSION = "v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `/api/${API_VERSION}/auth/login`,
    LOGOUT: `/api/${API_VERSION}/auth/logout`,
  },
  CATEGORIES: {
    BASE: `/api/${API_VERSION}/categories`,
    BY_ID: (id: string) => `/api/${API_VERSION}/categories/${id}`,
  },
  GROUPS: {
    BASE: `/api/${API_VERSION}/groups`,
    BY_ID: (id: string) => `/api/${API_VERSION}/groups/${id}`,
    ADD_USERS: (id: string) => `/api/${API_VERSION}/groups/${id}/users`,
  },
  EXPENSES: {
    BASE: `/api/${API_VERSION}/expenses`,
  },
};

export const options = {
  scenarios: {
    // Average load test
    average_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 100 }, // Ramp up
        { duration: "5m", target: 100 }, // Stay at peak
        { duration: "2m", target: 0 }, // Ramp down
      ],
      tags: { test_type: "average_load" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should complete within 2s
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

export const TEST_USERS = {
  USER: {
    email: "user.loadtest@yopmail.com",
    password: "Password123!",
    fullName: "Load Test User",
  },
  ADMIN: {
    email: "admin.loadtest@yopmail.com",
    password: "Password123!",
    fullName: "Load Test Admin",
  },
};
