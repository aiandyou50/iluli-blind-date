const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    // In development, we directly call the remote worker URL.
    return 'https://iluli-blind-date-worker.x00518.workers.dev';
  } else {
    // In production, the frontend is served from the same domain as the worker,
    // so we can use a relative path.
    return ''; // Or could be '/api' if the worker handles paths.
  }
};

export const API_BASE_URL = getBaseUrl();

// Example of an API client function
export const apiClient = async (path: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
};
