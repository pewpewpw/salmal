const API_BASE_URL = 'http://localhost:3001/api';

export interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  selects: number;
  passes: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryStats {
  category: string;
  itemCount: number;
  totalSelects: number;
  totalPasses: number;
}

export interface OverallStats {
  totalItems: number;
  totalSelects: number;
  totalPasses: number;
  totalVotes: number;
}

// API 호출 유틸리티 함수
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 아이템 관련 API
export const itemsApi = {
  // 모든 아이템 조회
  getAll: (category?: string): Promise<Item[]> => {
    const params = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    return apiCall<Item[]>(`/items${params}`);
  },

  // 특정 아이템 조회
  getById: (id: number): Promise<Item> => {
    return apiCall<Item>(`/items/${id}`);
  },

  // 투표 처리
  vote: (id: number, action: 'select' | 'pass'): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/items/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // 새 아이템 추가
  create: (item: Omit<Item, 'id' | 'selects' | 'passes'>): Promise<{ id: number; message: string }> => {
    return apiCall<{ id: number; message: string }>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // 아이템 수정
  update: (id: number, item: Partial<Item>): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // 아이템 삭제
  delete: (id: number): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// 통계 관련 API
export const statsApi = {
  // 카테고리별 통계
  getCategories: (): Promise<CategoryStats[]> => {
    return apiCall<CategoryStats[]>('/stats/categories');
  },

  // 전체 통계
  getOverall: (): Promise<OverallStats> => {
    return apiCall<OverallStats>('/stats/overall');
  },
}; 