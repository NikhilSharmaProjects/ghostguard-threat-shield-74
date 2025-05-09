
const API_BASE_URL = 'http://localhost:3001/api';

// Check if the backend service is available
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Small timeout to prevent long waits
      signal: AbortSignal.timeout(3000)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend availability check failed:', error);
    return false;
  }
};

// Check for specific features availability
export const checkFeatureAvailability = async (feature: 'whatsapp' | 'email' | 'both'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/features/${feature}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.available === true;
    }
    return false;
  } catch (error) {
    console.error(`Feature check for ${feature} failed:`, error);
    return false;
  }
};

// Check backend version
export const getBackendVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/version`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.version;
    }
    return null;
  } catch (error) {
    console.error('Backend version check failed:', error);
    return null;
  }
};
