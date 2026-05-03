import axios from 'axios';

// By default assuming the backend is running on the same host but port 3000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api/v1/smart-home';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const smartHomeApi = {
    getAllDevices: () => apiClient.get('/devices').then(res => res.data.data),
    discover: (timeoutMs = 4000) => apiClient.get(`/discover?timeoutMs=${timeoutMs}`).then(res => res.data.data),
    // Returns device data from local server DB (old "info")
    getDeviceFromDb: (deviceId) => apiClient.get(`/device?deviceId=${deviceId}`).then(res => res.data.data),
    // Returns current runtime info directly from device API (old "status")
    getDeviceInfo: (deviceId) => apiClient.get(`/info?deviceId=${deviceId}`).then(res => res.data.data),
    controlDevice: (deviceId, state) => apiClient.post('/control', { deviceId, state }).then(res => res.data),
    registerDevice: (device) => apiClient.post('/register', device).then(res => res.data),
    updateDeviceInfo: (deviceId, location, name) => apiClient.post('/info', { deviceId, location, name }).then(res => res.data),
    deleteDevice: (deviceId) => apiClient.delete(`/devices/${deviceId}`).then(res => res.data)
};
