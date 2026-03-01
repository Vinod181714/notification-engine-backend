import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

let socket = null;

export function initSocket() {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const token = Cookies.get('token');
    // create socket but don't auto connect yet so we can set auth explicitly
    socket = io(url, { transports: ['websocket'], autoConnect: false, auth: { token } });
    // handle unauthorized connect errors
    socket.on('connect_error', (err) => {
      if (err && err.message && err.message.toLowerCase().includes('unauthorized')) {
        Cookies.remove('token');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    });
    // connect with current auth
    try { socket.connect(); } catch (e) {}
  }
  return socket;
}

export function refreshAuth() {
  if (!socket) return;
  const token = Cookies.get('token');
  socket.auth = { token };
  if (!socket.connected) {
    try { socket.connect(); } catch (e) {}
  }
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
