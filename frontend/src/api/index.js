// ─── API Configuration ───
// Use environment variable for production, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Helper function for API calls
async function request(url, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${url}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        if (!res.ok) {
            const err = await res.text().catch(() => res.statusText);
            throw new Error(err || `HTTP ${res.status}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : {};
    } catch (err) {
        console.error(`API Error [${options.method || 'GET'} ${url}]:`, err.message);
        throw err;
    }
}

// ─── Auth API ───
export const authApi = {
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Student API ───
export const studentApi = {
    getAll: () => request('/students'),
    getById: (id) => request(`/students/${id}`),
    create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
    search: (query) => request(`/students/search?query=${encodeURIComponent(query)}`),
};

// ─── Course API ───
export const courseApi = {
    getAll: () => request('/courses'),
    getById: (id) => request(`/courses/${id}`),
    create: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
};

// ─── Attendance API ───
export const attendanceApi = {
    getAll: () => request('/attendance'),
    getByStudent: (studentId) => request(`/attendance/student/${studentId}`),
    mark: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Grade API ───
export const gradeApi = {
    getAll: () => request('/grades'),
    getByStudent: (studentId) => request(`/grades/student/${studentId}`),
    create: (data) => request('/grades', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/grades/${id}`, { method: 'DELETE' }),
};

// ─── Fee API ───
export const feeApi = {
    getAll: () => request('/fees'),
    getByStudent: (studentId) => request(`/fees/student/${studentId}`),
    create: (data) => request('/fees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Notice API ───
export const noticeApi = {
    getAll: () => request('/notices'),
    create: (data) => request('/notices', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/notices/${id}`, { method: 'DELETE' }),
};
