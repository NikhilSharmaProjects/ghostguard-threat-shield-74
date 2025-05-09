
const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

// WebSocket connection
let socket: WebSocket | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Store message handlers
type MessageHandler = (data: any) => void;
const messageHandlers: MessageHandler[] = [];

// Initialize WebSocket connection
export const initializeWebSocket = (): Promise<boolean> => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return Promise.resolve(true);
  }
  
  if (isConnecting) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }
  
  return new Promise((resolve) => {
    isConnecting = true;
    
    try {
      socket = new WebSocket(WS_URL);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        isConnecting = false;
        reconnectAttempts = 0;
        resolve(true);
        
        // Notify any handlers waiting for connection
        dispatchEvent({ type: 'connection', status: 'connected' });
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Dispatch to all registered handlers
          messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting = false;
      };
      
      socket.onclose = () => {
        console.log('WebSocket closed');
        isConnecting = false;
        
        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(() => {
            initializeWebSocket();
          }, 2000 * reconnectAttempts); // Exponential backoff
        } else {
          dispatchEvent({ type: 'connection', status: 'disconnected', error: 'Max reconnect attempts reached' });
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnecting = false;
      resolve(false);
    }
  });
};

// Send message through WebSocket
export const sendWebSocketMessage = (message: any): boolean => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('Cannot send message: WebSocket not connected');
    return false;
  }
  
  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

// Register a message handler
export const onWebSocketMessage = (handler: MessageHandler): () => void => {
  messageHandlers.push(handler);
  return () => {
    const index = messageHandlers.indexOf(handler);
    if (index !== -1) {
      messageHandlers.splice(index, 1);
    }
  };
};

// Dispatch event to all handlers
const dispatchEvent = (event: any) => {
  messageHandlers.forEach(handler => handler(event));
};

// Close WebSocket connection
export const closeWebSocketConnection = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

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
