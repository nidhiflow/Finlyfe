// API Configuration — uses /api proxy which Render rewrites to backend
const API_BASE_URL = "/api";

// Token keys — must match desktop (finly_token, finly_user)
const AUTH_TOKEN_KEY = "finly_token";
const AUTH_USER_KEY = "finly_user";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  requireOTP?: boolean;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (
    token &&
    !endpoint.includes("/auth/signup") &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/verify") &&
    !endpoint.includes("/auth/forgot")
  ) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle both 200 and 201 as success
  if (!response.ok && response.status !== 201) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.message ||
        errorData.error ||
        errorData.details ||
        errorMessage;
    } catch (e) {
      /* ignore parse error */
    }
    throw new Error(errorMessage);
  }

  // Check if there's actually JSON content to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {} as T;
}

// Auth API
export const authAPI = {
  // Sign up - Step 1
  signup: async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => {
    return apiCall<{ message: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Verify OTP after signup - Step 2
  verifySignupOTP: async (data: { email: string; otp: string }) => {
    const response = await apiCall<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        code: data.otp,
        type: "signup",
      }),
    });

    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  // Login - Step 1
  login: async (data: { email: string; password: string }) => {
    const response = await apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // If no OTP required, store token immediately
    if (response.token && response.user) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  // Verify OTP for login (if requireOTP: true)
  verifyLoginOTP: async (data: { email: string; otp: string }) => {
    const response = await apiCall<AuthResponse>("/auth/verify-login-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        code: data.otp,
      }),
    });

    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }

    return response;
  },

  // Forgot password - Step 1
  forgotPassword: async (data: { email: string }) => {
    return apiCall<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Verify OTP for password reset - Step 2
  verifyResetOTP: async (data: {
    email: string;
    otp: string;
    type: "reset";
  }) => {
    return apiCall<{ message: string; resetToken?: string }>(
      "/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          code: data.otp,
          type: data.type,
        }),
      }
    );
  },

  // Reset password - Step 3
  resetPassword: async (data: {
    email: string;
    newPassword: string;
    resetToken?: string;
  }) => {
    return apiCall<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get current user profile
  getProfile: async () => {
    return apiCall<User>("/auth/me", {
      method: "GET",
    });
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    return apiCall<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Update password
  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiCall<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete account
  deleteAccount: async () => {
    return apiCall<{ message: string }>("/auth/account", {
      method: "DELETE",
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any[]>(`/transactions${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  },

  getById: async (id: string) => {
    return apiCall<any>(`/transactions/${id}`, {
      method: "GET",
    });
  },

  create: async (data: any) => {
    return apiCall<any>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return apiCall<any>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiCall<{ message: string }>(`/transactions/${id}`, {
      method: "DELETE",
    });
  },

  getUpcomingRecurring: async () => {
    return apiCall<any[]>("/transactions/upcoming-recurring", {
      method: "GET",
    });
  },

  getSuggestions: async () => {
    return apiCall<any[]>("/transactions/suggestions", {
      method: "GET",
    });
  },
};

// Categories API
export const categoriesAPI = {
  list: async () => apiCall<any[]>("/categories"),
  create: async (data: any) =>
    apiCall<any>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: any) =>
    apiCall<any>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    apiCall<any>(`/categories/${id}`, { method: "DELETE" }),
};

// Accounts API
export const accountsAPI = {
  list: async () => apiCall<any[]>("/accounts"),
  create: async (data: any) =>
    apiCall<any>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: any) =>
    apiCall<any>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    apiCall<any>(`/accounts/${id}`, { method: "DELETE" }),
};

// Budgets API
export const budgetsAPI = {
  list: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any[]>(`/budgets${qs ? `?${qs}` : ""}`);
  },
  create: async (data: any) =>
    apiCall<any>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: any) =>
    apiCall<any>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    apiCall<any>(`/budgets/${id}`, { method: "DELETE" }),
};

// Savings Goals API
export const savingsGoalsAPI = {
  list: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any[]>(`/savings-goals${qs ? `?${qs}` : ""}`);
  },
  create: async (data: any) =>
    apiCall<any>("/savings-goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: any) =>
    apiCall<any>(`/savings-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string) =>
    apiCall<any>(`/savings-goals/${id}`, { method: "DELETE" }),
  recordSavings: async (id: string, amount: number) =>
    apiCall<any>(`/savings-goals/${id}/record`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
};

// Stats API
export const statsAPI = {
  summary: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any>(`/stats/summary${qs ? `?${qs}` : ""}`);
  },
  byCategory: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any[]>(`/stats/by-category${qs ? `?${qs}` : ""}`);
  },
  trend: async (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall<any[]>(`/stats/trend${qs ? `?${qs}` : ""}`);
  },
  calendar: async (year: number, month: number) =>
    apiCall<any>(`/stats/calendar/${year}/${month}`),
  insights: async () => apiCall<any>("/stats/insights"),
  finlyScore: async () => apiCall<any>("/stats/finly-score"),
  weeklySummary: async () => apiCall<any[]>("/stats/weekly-summary"),
  forecast: async () => apiCall<any>("/stats/forecast"),
};

// Bookmarks API
export const bookmarksAPI = {
  list: async () => apiCall<any[]>("/bookmarks"),
  add: async (transaction_id: string) =>
    apiCall<any>("/bookmarks", {
      method: "POST",
      body: JSON.stringify({ transaction_id }),
    }),
  remove: async (transactionId: string) =>
    apiCall<any>(`/bookmarks/${transactionId}`, { method: "DELETE" }),
  getIds: async () => apiCall<any>("/bookmarks/ids"),
};

// Settings API
export const settingsAPI = {
  get: async () => apiCall<any>("/settings"),
  update: async (data: any) =>
    apiCall<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// AI API
export const aiAPI = {
  scanReceipt: async (data: any) =>
    apiCall<any>("/ai/scan-receipt", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  chat: async (data: any) =>
    apiCall<any>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getChatHistory: async () => apiCall<any[]>("/ai/chat-history"),
  clearChat: async () =>
    apiCall<any>("/ai/clear-chat", { method: "POST" }),
  getInsights: async () => apiCall<any>("/ai/insights"),
};

// Export the base URL for other uses
export { API_BASE_URL };