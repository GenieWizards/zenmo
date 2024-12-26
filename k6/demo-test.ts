import { check, sleep } from "k6";
import http from "k6/http";
import type { Options } from "k6/options";

/**
 * Configuration options for the k6 load test.
 * - vus: Number of virtual users.
 * - thresholds: Performance thresholds for the test.
 * - stages: Load stages for the test.
 */
// export const options: Options = {
//   vus: 10,
//   // duration: "5m",
//   thresholds: {
//     http_req_failed: ["rate<0.01"], // http errors should be less than 1%
//     http_req_duration: ["p(99)<500"], // 99% of requests should be below 500ms
//   },
//   stages: [
//     // level 1
//     { duration: "1m", target: 100 },
//     { duration: "2m", target: 100 },
//     // level 2
//     { duration: "1m", target: 200 },
//     { duration: "2m", target: 200 },
//     // level 3
//     { duration: "1m", target: 500 },
//     { duration: "2m", target: 500 },
//     // cool down
//     { duration: "1m", target: 0 },
//   ],
// };

/**
 * Configuration options for the k6 stress test.
 * - vus: Number of virtual users.
 * - thresholds: Performance thresholds for the test.
 * - stages: Load stages for the test.
 */
// export const options: Options = {
//   vus: 10,
//   thresholds: {
//     http_req_failed: ["rate<0.01"], // http errors should be less than 1%
//     http_req_duration: ["p(99)<500"], // 99% of requests should be below 500ms
//   },
//   stages: [
//     // level 1
//     { duration: "1m", target: 100 },
//     { duration: "2m", target: 100 },
//     // level 2
//     { duration: "1m", target: 200 },
//     { duration: "2m", target: 200 },
//     // level 3
//     { duration: "1m", target: 500 },
//     { duration: "2m", target: 500 },
//     // cool down
//     { duration: "1m", target: 0 },
//   ],
// };

/**
 * Configuration options for the k6 spike test.
 * - vus: Number of virtual users.
 * - thresholds: Performance thresholds for the test.
 * - stages: Load stages for the test.
 */
export const options: Options = {
  vus: 10,
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<500"], // 99% of requests should be below 500ms
  },
  stages: [
    // level 1
    { duration: "30s", target: 100 },

    // spike
    { duration: "1m", target: 2_000 },
    { duration: "10s", target: 2_000 },
    { duration: "1m", target: 100 },

    // cool down
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const res = http.get("http://localhost:8998/api/health-check");
  check(res, {
    "status was 200": r => r.status === 200,
    "duration was <500ms": r => r.timings.duration <= 500,
  });

  sleep(1);
}
