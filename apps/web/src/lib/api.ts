const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('scalefit_token', token);
    } else {
      localStorage.removeItem('scalefit_token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('scalefit_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: string }) {
    const result = await this.request<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.accessToken);
    return result;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Users
  async getProfile() {
    return this.request<any>('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAthletes() {
    return this.request<any[]>('/users/athletes');
  }

  async getAthlete(id: string) {
    return this.request<any>(`/users/athletes/${id}`);
  }

  async getAthleteStats(id: string) {
    return this.request<any>(`/users/athletes/${id}/stats`);
  }

  // Workouts
  async getWorkoutPlans(templates = false) {
    return this.request<any[]>('/workouts/plans', {
      params: templates ? { templates: 'true' } : undefined,
    });
  }

  async getWorkoutPlan(id: string) {
    return this.request<any>(`/workouts/plans/${id}`);
  }

  async createWorkoutPlan(data: any) {
    return this.request<any>('/workouts/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExercises(filters?: { muscle?: string; equipment?: string; search?: string }) {
    return this.request<any[]>('/workouts/exercises', {
      params: filters as any,
    });
  }

  async assignWorkoutPlan(planId: string, userId: string) {
    return this.request<any>(`/workouts/plans/${planId}/assign/${userId}`, {
      method: 'POST',
    });
  }

  async assignWorkoutPlanBulk(planId: string, userIds: string[]) {
    return this.request<any>(`/workouts/plans/${planId}/assign-bulk`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  async logWorkoutSet(data: any) {
    return this.request<any>('/workouts/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLastSessionData(exerciseId: string) {
    return this.request<any[]>(`/workouts/log/last/${exerciseId}`);
  }

  // Nutrition
  async getNutritionPlans(templates = false) {
    return this.request<any[]>('/nutrition/plans', {
      params: templates ? { templates: 'true' } : undefined,
    });
  }

  async getNutritionPlan(id: string) {
    return this.request<any>(`/nutrition/plans/${id}`);
  }

  async createNutritionPlan(data: any) {
    return this.request<any>('/nutrition/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchFoods(query: string, category?: string) {
    return this.request<any[]>('/nutrition/foods', {
      params: { q: query, ...(category ? { category } : {}) },
    });
  }

  async calculateFoodSwap(data: {
    originalFoodId: string;
    originalQuantity: number;
    targetFoodId: string;
    swapByMacro: string;
  }) {
    return this.request<any>('/nutrition/swap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logFood(data: { foodItemId: string; mealType: string; quantityGrams: number }) {
    return this.request<any>('/nutrition/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDailyNutrition(date?: string) {
    return this.request<any>('/nutrition/log/daily', {
      params: date ? { date } : undefined,
    });
  }

  async generateGroceryList(nutritionPlanId: string, weekStartDate: string) {
    return this.request<any>('/nutrition/grocery-list/generate', {
      method: 'POST',
      body: JSON.stringify({ nutritionPlanId, weekStartDate }),
    });
  }

  // Check-ins
  async submitCheckIn(data: any) {
    return this.request<any>('/check-ins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async canAccessNextBlock() {
    return this.request<any>('/check-ins/can-access');
  }

  async getCheckInsKanban() {
    return this.request<any>('/check-ins/kanban');
  }

  async getCheckIn(id: string) {
    return this.request<any>(`/check-ins/${id}`);
  }

  async reviewCheckIn(id: string, data: { coachNotes?: string; coachFeedback: string; flagged?: boolean }) {
    return this.request<any>(`/check-ins/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAthleteProgress(athleteId: string) {
    return this.request<any>(`/check-ins/athlete/${athleteId}/progress`);
  }

  // Alerts
  async getAlerts(unreadOnly = false) {
    return this.request<any[]>('/alerts', {
      params: unreadOnly ? { unreadOnly: 'true' } : undefined,
    });
  }

  async getAlertCounts() {
    return this.request<{ total: number; unread: number; critical: number }>('/alerts/counts');
  }

  async markAlertAsRead(id: string) {
    return this.request<any>(`/alerts/${id}/read`, {
      method: 'PUT',
    });
  }

  async dismissAlert(id: string) {
    return this.request<any>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async runSmartChecks() {
    return this.request<any>('/alerts/run-checks');
  }

  // Chat
  async getConversations() {
    return this.request<any[]>('/chat/conversations');
  }

  async getConversation(partnerId: string, limit?: number) {
    return this.request<any[]>(`/chat/conversations/${partnerId}`, {
      params: limit ? { limit: limit.toString() } : undefined,
    });
  }

  async sendMessage(receiverId: string, content: string, attachmentUrl?: string) {
    return this.request<any>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, attachmentUrl }),
    });
  }

  async markConversationAsRead(partnerId: string) {
    return this.request<any>(`/chat/conversations/${partnerId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadCount() {
    return this.request<{ unreadCount: number }>('/chat/unread-count');
  }

  // Templates
  async getTemplates(type?: string, includePublic = false) {
    return this.request<any[]>('/templates', {
      params: {
        ...(type ? { type } : {}),
        ...(includePublic ? { includePublic: 'true' } : {}),
      },
    });
  }

  async getTemplate(id: string) {
    return this.request<any>(`/templates/${id}`);
  }

  async createTemplate(data: any) {
    return this.request<any>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async duplicateTemplate(id: string, newName?: string) {
    return this.request<any>(`/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName }),
    });
  }

  async getTemplateStats() {
    return this.request<any>('/templates/stats');
  }

  // Calculator
  async calculateTDEE(data: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: string;
    activityLevel: string;
  }) {
    return this.request<any>('/calculator/tdee', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async calculateMacros(data: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
  }) {
    return this.request<any>('/calculator/macros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
export default api;

