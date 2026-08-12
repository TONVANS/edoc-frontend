// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: (Removed Authorization injection as it is now handled by the server proxy) ──
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor: Global error handling with Sonner toasts ──
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      toast.error('ການເຊື່ອມຕໍ່ລົ້ມເຫຼວ', {
        description: 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດ.',
        // Connection failed - Cannot connect to server. Please check your internet connection.
      });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const backendError = error.response.data?.error;
    const backendMessage = backendError?.message;

    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // 400 Bad Request or similar client errors
    if (status >= 400 && status < 500 && status !== 401 && status !== 403) {
      if (!isLoginRequest) {
        toast.error('ເກີດຂໍ້ຜິດພາດ', {
          description: backendMessage || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ ຫຼື ມີບາງຢ່າງຜິດພາດ.',
        });
      }
    }

    // 401 Unauthorized — session expired or invalid token
    if (status === 401) {
      Cookies.remove('accessToken');
      localStorage.removeItem('user');
      
      if (!isLoginRequest) {
        toast.error('ເຊດຊັນໝົດອາຍຸ', {
          description: 'ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່.',
          // Session expired — Please log in again.
        });
        // Redirect to login (safe for both client & SSR contexts)
        if (typeof window !== 'undefined') {
          const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?callbackUrl=${callbackUrl}`;
        }
      }
    }

    // 403 Forbidden
    if (status === 403) {
      if (!isLoginRequest) {
        toast.error('ບໍ່ມີສິດເຂົ້າເຖິງ', {
          description: backendMessage || 'ທ່ານບໍ່ມີສິດໃນການດຳເນີນການນີ້.',
          // Access denied — You do not have permission for this action.
        });
      }
    }

    // 500+ Server errors
    if (status >= 500) {
      if (!isLoginRequest) {
        toast.error('ເກີດຂໍ້ຜິດພາດຈາກເຊີບເວີ', {
          description: backendMessage || 'ກະລຸນາລອງໃໝ່ພາຍຫຼັງ ຫຼື ຕິດຕໍ່ຜູ້ດູແລລະບົບ.',
          // Server error — Please try again later or contact the administrator.
        });
      }
    }

    return Promise.reject(error);
  }
);

// ── Helper: Build FormData from object + files ──
export function buildFormData(
  payload: Record<string, unknown>,
  files?: File[],
  fileFieldName = 'files'
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'boolean') {
      formData.append(key, String(value));
    } else if (typeof value === 'number') {
      formData.append(key, String(value));
    } else if (typeof value === 'string') {
      formData.append(key, value);
    }
  });

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append(fileFieldName, file);
    });
  }

  return formData;
}

export default api;
