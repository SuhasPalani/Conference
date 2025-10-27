export const verifyOTP = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resendOTP = (email) => api.post('/auth/resend-otp', { email });

// Role Requests
export const submitRoleRequest = (data) => api.post('/role-requests', data);
export const getMyRoleRequests = () => api.get('/role-requests/my');

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put('/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// Admin - Role Requests
export const getRoleRequests = (params) => api.get('/admin/role-requests', { params });
export const reviewRoleRequest = (userId, requestId, data) => 
  api.put(`/admin/role-requests/${userId}/${requestId}`, data);