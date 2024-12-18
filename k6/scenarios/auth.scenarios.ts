import { check, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const loginSuccess = new Rate("login_success");
const loginDuration = new Trend("login_duration");

// Test configuration
export const options = {
  scenarios: {
    login_flow: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 30 },
        { duration: "1m", target: 30 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
    login_success: ["rate>0.95"],
  },
};

const BASE_URL = "http://localhost:8998";
const TEST_CREDENTIALS = [
  { email: "user1@yopmail.com", password: "12345678" },
  { email: "user2@yopmail.com", password: "12345678" },
  { email: "admin1@yopmail.com", password: "12345678" },
];

export function setup() {
  return { startTime: new Date().toISOString() };
}

export default function () {
  const testUser
    = TEST_CREDENTIALS[Math.floor(Math.random() * TEST_CREDENTIALS.length)];

  const loginResponse = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  loginDuration.add(loginResponse.timings.duration);

  // Parse response body safely
  let responseBody;
  try {
    responseBody = JSON.parse(loginResponse.body as string);
  } catch (e) {
    return JSON.stringify(e);
  }

  // Type guard function
  const isLoginSuccess = (response: any): response is any => {
    return response.data !== undefined && response.data.session !== undefined;
  };

  // Basic response checks
  const checkResult = check(loginResponse, {
    "status is 200": r => r.status === 200,
    "has valid content-type": r =>
      r.headers["Content-Type"]?.includes("application/json"),
    "response time OK": r => r.timings.duration < 2000,
  });

  // Response body checks
  if (responseBody) {
    check(responseBody, {
      "has message field": r => typeof r.message === "string",
      "has success field": r => typeof r.success === "boolean",
    });

    if (loginResponse.status === 200 && isLoginSuccess(responseBody)) {
      check(responseBody, {
        "has valid session": r => typeof r.data.session === "string",
        "has valid email": r => r.data.email === testUser.email,
        "success is true": r => r.success === true,
      });
    } else {
      check(responseBody, {
        "has error message": r => typeof r.message === "string",
        "success is false": r => r.success === false,
      });
    }
  }

  loginSuccess.add(checkResult);

  sleep(1);
}

export function handleSummary(data: any) {
  return {
    "stdout": textSummary(data),
    "login-test-summary.json": JSON.stringify(data),
  };
}

function textSummary(data: any) {
  return `
    Login Performance Test Summary
    ============================
    Duration: ${Math.round(data.metrics.iteration_duration.values.avg * 1000)}ms (avg)
    Success Rate: ${(data.metrics.login_success.values.rate * 100).toFixed(2)}%
    Total Requests: ${data.metrics.iterations.values.count}
    Failed Requests: ${data.metrics.http_req_failed.values.passes}
    95th Percentile: ${data.metrics.http_req_duration.values["p(95)"].toFixed(2)}ms
  `;
}
