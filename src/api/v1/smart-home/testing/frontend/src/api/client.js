import axios from 'axios';

// By default assuming the backend is running on the same host but port 3000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/smart-home';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const smartHomeApi = {
    getAllDevices: () => apiClient.get('/devices').then(res => res.data.data),
    discover: (timeoutMs = 4000) => apiClient.get(`/discover?timeoutMs=${timeoutMs}`).then(res => res.data.data),
    getDeviceInfo: (deviceId) => apiClient.get(`/info?deviceId=${deviceId}`).then(res => res.data.data),
    getDeviceStatus: (deviceId) => apiClient.get(`/status?deviceId=${deviceId}`).then(res => res.data.data),
    controlDevice: (deviceId, state) => apiClient.post('/control', { deviceId, state }).then(res => res.data),
    registerDevice: (device) => apiClient.post('/register', device).then(res => res.data),
    updateLocation: (deviceId, location) => apiClient.put('/location', { deviceId, location }).then(res => res.data),
    deleteDevice: (deviceId) => apiClient.delete(`/devices/${deviceId}`).then(res => res.data)
};
