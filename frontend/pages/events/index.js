import { useEffect, useState } from 'react';
import api from '../../lib/api';
import EventCard from '../../components/EventCard';
import { getSocket } from '../../lib/socket';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/events');
        setEvents(res.data.items || []);
      } catch (err) {
        console.error('load events error', err);
        setError(err.message || 'Network Error');
      }
      setLoading(false);
    };
    load();
    const s = getSocket();
    if (s) {
      const onProcessed = (payload) => {
        // payload.notification may contain the new notification
        const n = payload.notification || payload;
        setEvents(prev => [n, ...prev]);
      };
      const onAI = (payload) => {
        const n = payload.notification || payload;
        // update existing item if present
        setEvents(prev => {
          const found = prev.findIndex(p => p._id === n._id);
          if (found !== -1) {
            const copy = [...prev];
            copy[found] = n;
            return copy;
          }
          return [n, ...prev];
        });
      };
      s.on('notification:processed', onProcessed);
      s.on('notification:ai_complete', onAI);
      return () => {
        s.off('notification:processed', onProcessed);
        s.off('notification:ai_complete', onAI);
      };
    }
  }, []);

  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <h1>Events</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      {events.map(e => <EventCard key={e._id} event={e} />)}
    </div>
  );
}
