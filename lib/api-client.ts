import { BaseError } from './errors/custom-errors';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    name: string;
    statusCode: number;
    details?: unknown;
  };
  message?: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends BaseError {
  constructor(message: string, statusCode: number, public details?: unknown) {
    super(message, statusCode);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(this.baseUrl + endpoint, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;
    
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        'Failed to parse response',
        response.status
      );
    }

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || 'An unexpected error occurred',
        data.error?.statusCode || response.status,
        data.error?.details
      );
    }

    return data.data as T;
  }

  public async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      ...init,
    });

    return this.handleResponse<T>(response);
  }

  public async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...init,
    });

    return this.handleResponse<T>(response);
  }

  public async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...init,
    });

    return this.handleResponse<T>(response);
  }

  public async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      ...init,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = ApiClient.getInstance(); 