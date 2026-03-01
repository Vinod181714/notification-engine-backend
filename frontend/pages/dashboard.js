import { useEffect, useState } from 'react';
import api from '../lib/api';
import { getSocket } from '../lib/socket';

export default function LiveDashboard(){
  const [stats, setStats] = useState({
    totalToday: 0,
    classificationBreakdown: {},
    queuePending: 0,
    dbStatus: 'unknown',
    aiCircuit: 'unknown'
  });
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get metrics
        const metricsRes = await api.get('/api/metrics');
        const healthRes = await api.get('/api/health');
        const queueRes = await api.get('/api/later-queue');
        const eventsRes = await api.get('/api/events?limit=10&page=1');
        
        setStats({
          totalToday: metricsRes.data.totalToday,
          classificationBreakdown: metricsRes.data.classificationBreakdown,
          queuePending: queueRes.data.items?.filter(i => i.status === 'PENDING').length || 0,
          dbStatus: healthRes.data.db,
          aiCircuit: healthRes.data.aiCircuit
        });
        
        setRecentEvents(eventsRes.data.items || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Listen for real-time events via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onProcessed = (notification) => {
      setRecentEvents(prev => [notification, ...prev.slice(0, 9)]);
      setStats(prev => ({
        ...prev,
        totalToday: prev.totalToday + 1,
        classificationBreakdown: {
          ...prev.classificationBreakdown,
          [notification.classification]: (prev.classificationBreakdown[notification.classification] || 0) + 1
        }
      }));
    };

    const onAIComplete = (data) => {
      setRecentEvents(prev => prev.map(e => 
        e._id === data.notification_id 
          ? { ...e, ai_classification: data.classification, ai_is_fallback: data.is_fallback }
          : e
      ));
    };

    socket.on('notification:processed', onProcessed);
    socket.on('notification:ai_complete', onAIComplete);

    return () => {
      socket.off('notification:processed', onProcessed);
      socket.off('notification:ai_complete', onAIComplete);
    };
  }, []);

  if (loading) return <div style={{maxWidth: 1200, margin: '20px auto'}}>Loading dashboard...</div>;

  const statusColor = (status) => {
    if (status === 'connected' || status === 'CLOSED' || status === 'DONE') return '#4CAF50';
    if (status === 'PENDING' || status === 'HALF_OPEN') return '#FFC107';
    return '#f44336';
  };

  return (
    <div style={{maxWidth: 1200, margin: '24px auto'}}>
      <h1>📊 Live Dashboard</h1>
      
      {error && <div style={{color: 'red', marginBottom: 20}}>Error: {error}</div>}

      {/* Stats Grid */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30}}>
        
        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>📈 Events Today</h3>
          <div style={{fontSize: 32, fontWeight: 'bold', color: '#2196F3'}}>{stats.totalToday}</div>
          <small style={{color: '#666'}}>Total notifications processed</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>⚡ Priority NOW</h3>
          <div style={{fontSize: 32, fontWeight: 'bold', color: '#FF9800'}}>{stats.classificationBreakdown.NOW || 0}</div>
          <small style={{color: '#666'}}>Sent immediately</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>⏱️ Queued (LATER)</h3>
          <div style={{fontSize: 32, fontWeight: 'bold', color: '#FFC107'}}>{stats.classificationBreakdown.LATER || 0}</div>
          <small style={{color: '#666'}}>Batch processing</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>🔕 Never</h3>
          <div style={{fontSize: 32, fontWeight: 'bold', color: '#9E9E9E'}}>{stats.classificationBreakdown.NEVER || 0}</div>
          <small style={{color: '#666'}}>Filtered out</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>📦 Pending Queue</h3>
          <div style={{fontSize: 32, fontWeight: 'bold', color: '#4CAF50'}}>{stats.queuePending}</div>
          <small style={{color: '#666'}}>Items awaiting processing</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>🔌 Database</h3>
          <div style={{fontSize: 20, fontWeight: 'bold', color: statusColor(stats.dbStatus)}}>{stats.dbStatus}</div>
          <small style={{color: '#666'}}>MongoDB connection</small>
        </div>

        <div style={{padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9'}}>
          <h3 style={{margin: '0 0 10px 0', color: '#333'}}>🤖 AI Circuit</h3>
          <div style={{fontSize: 20, fontWeight: 'bold', color: statusColor(stats.aiCircuit)}}>{stats.aiCircuit}</div>
          <small style={{color: '#666'}}>OpenAI integration</small>
        </div>
      </div>

      {/* Recent Events */}
      <div style={{marginTop: 30}}>
        <h2>🔔 Recent Events (Real-time)</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          {recentEvents.length === 0 ? (
            <div style={{padding: 20, textAlign: 'center', color: '#999'}}>
              No events yet. Create one from the Simulator page!
            </div>
          ) : (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                  <th style={{padding: 12, textAlign: 'left', fontWeight: 'bold'}}>Event Type</th>
                  <th style={{padding: 12, textAlign: 'left', fontWeight: 'bold'}}>Message</th>
                  <th style={{padding: 12, textAlign: 'center', fontWeight: 'bold'}}>Classification</th>
                  <th style={{padding: 12, textAlign: 'center', fontWeight: 'bold'}}>Priority</th>
                  <th style={{padding: 12, textAlign: 'right', fontWeight: 'bold'}}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((evt, idx) => (
                  <tr key={evt._id} style={{borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'}}>
                    <td style={{padding: 12, fontWeight: 'bold', color: '#2196F3'}}>{evt.event_type}</td>
                    <td style={{padding: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{evt.message}</td>
                    <td style={{padding: 12, textAlign: 'center', fontWeight: 'bold', color: statusColor(evt.classification)}}>
                      {evt.classification}
                    </td>
                    <td style={{padding: 12, textAlign: 'center', color: '#666'}}>{evt.priority_hint}</td>
                    <td style={{padding: 12, textAlign: 'right', fontSize: '0.9em', color: '#999'}}>
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div style={{marginTop: 30, padding: 15, backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196F3', borderRadius: 4}}>
        <h4>✨ Dashboard Features:</h4>
        <ul style={{margin: 10}}>
          <li>Real-time event updates via Socket.io</li>
          <li>Live metrics from the past 24 hours</li>
          <li>System health status monitoring</li>
          <li>Classification breakdown (NOW/LATER/NEVER)</li>
          <li>Auto-refresh every 5 seconds</li>
        </ul>
      </div>
    </div>
  );
}
