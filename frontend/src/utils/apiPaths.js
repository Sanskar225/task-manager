export const API_PATHS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/users/profile',
  
  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id) => `/tasks/${id}`,
  UPDATE_TASK_STATUS: (id) => `/tasks/${id}/status`,
  UPDATE_TASK_PROGRESS: (id) => `/tasks/${id}/progress`,
  UPDATE_TODO: (taskId, todoId) => `/tasks/${taskId}/todo/${todoId}`,
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  UPDATE_USER_STATUS: (id) => `/users/${id}/status`,
  
  // Reports
  EXPORT_TASKS_REPORT: '/reports/export/tasks',
  EXPORT_USERS_REPORT: '/reports/export/users'
};
