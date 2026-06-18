const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "prepmate_auth";

export const getAuthSession = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) || null;
  } catch {
    return null;
  }
};

export const setAuthSession = (session) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const { body, rawBody, headers: customHeaders, ...requestOptions } = options;
  const session = getAuthSession();
  const hasJsonBody = body !== undefined;
  const hasRawBody = rawBody !== undefined;
  const headers = {
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...customHeaders,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    body: hasRawBody ? rawBody : hasJsonBody ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { message: response.statusText };
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const authApi = {
  register: (payload) =>
    apiRequest("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/api/auth/login", { method: "POST", body: payload }),
  me: () => apiRequest("/api/auth/me"),
};

export const communicationApi = {
  health: () => apiRequest("/api/health"),
  models: () => apiRequest("/api/communication/models"),
  startTopic: () => apiRequest("/api/communication/start-topic", { method: "POST" }),
  analyze: (payload) =>
    apiRequest("/api/communication/analyze", { method: "POST", body: payload }),
  transcribe: (audioBlob, { topic, model } = {}) => {
    const params = new URLSearchParams();

    if (topic) {
      params.set("topic", topic);
    }

    if (model) {
      params.set("model", model);
    }

    const query = params.toString();

    return apiRequest(`/api/communication/transcribe${query ? `?${query}` : ""}`, {
      method: "POST",
      rawBody: audioBlob,
      headers: {
        "Content-Type": audioBlob?.type || "application/octet-stream",
      },
    });
  },
  history: () => apiRequest("/api/communication/history?limit=5"),
  stats: () => apiRequest("/api/communication/stats"),
  weeklyReport: () => apiRequest("/api/communication/report/weekly"),
  monthlySummary: () => apiRequest("/api/communication/summary/monthly"),
  exportHistory: (format = "json") =>
    apiRequest(`/api/communication/export?format=${format}`),
};

export const plannerApi = {
  today: () => apiRequest("/api/planner/today"),
  addTask: (payload) =>
    apiRequest("/api/planner/tasks", { method: "POST", body: payload }),
  updateTask: (taskId, payload) =>
    apiRequest(`/api/planner/tasks/${taskId}`, { method: "PATCH", body: payload }),
  deleteTask: (taskId) =>
    apiRequest(`/api/planner/tasks/${taskId}`, { method: "DELETE" }),
  updateGoal: (goalId, payload) =>
    apiRequest(`/api/planner/goals/${goalId}`, { method: "PATCH", body: payload }),
};
