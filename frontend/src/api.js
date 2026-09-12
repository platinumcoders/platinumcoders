// frontend/src/api.js
// API client module consuming endpoints E1–E5 per Appendix A & Thinker 2 spec §4.

const BASE_URL = "http://localhost:5000/api";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON or empty response body
  }

  if (!res.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : `Request failed (HTTP ${res.status}).`;
    throw new Error(message);
  }
  return data;
}

// E1: POST /api/applications (201 Created)
export function submitApplication(body) {
  return request("/applications", { method: "POST", body });
}

// E2: GET /api/decisions/:decisionId (200 OK)
export function getDecision(decisionId) {
  return request(`/decisions/${encodeURIComponent(decisionId)}`);
}

// E3: POST /api/decisions/:decisionId/replay (200 OK)
export function replayDecision(decisionId) {
  return request(`/decisions/${encodeURIComponent(decisionId)}/replay`, { method: "POST" });
}

// E4: GET /api/fairness/summary (200 OK)
export function getFairnessSummary() {
  return request("/fairness/summary");
}

// E5: POST /api/fairness/counterfactual (200 OK)
export function runCounterfactual(body) {
  return request("/fairness/counterfactual", { method: "POST", body });
}
