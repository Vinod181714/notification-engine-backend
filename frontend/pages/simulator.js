import { useState } from 'react';
import api from '../lib/api';

export default function EventSimulator(){
  const [eventType, setEventType] = useState('user.signup');
  const [message, setMessage] = useState('Test event generated');
  const [priorityHint, setPriorityHint] = useState('medium');
  const [channel, setChannel] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const res = await api.post('/api/events', {
        event_type: eventType,
        message,
        priority_hint: priorityHint,
        channel
      });
      
      setSuccess(`Event created successfully with classification: ${res.data.classification}`);
      setMessage('Test event generated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const presetEvents = [
    { type: 'user.signup', msg: 'New user registered from USA', priority: 'high', ch: 'email' },
    { type: 'payment.failed', msg: 'Payment failed for order #12345', priority: 'critical', ch: 'sms' },
    { type: 'login.attempt', msg: 'Failed login attempt detected', priority: 'medium', ch: 'push' },
    { type: 'user.activity', msg: 'User viewed product page', priority: 'low', ch: 'email' },
    { type: 'newsletter.pending', msg: 'Weekly newsletter ready to send', priority: 'low', ch: 'email' },
    { type: 'security.alert', msg: 'Unauthorized access attempt blocked', priority: 'critical', ch: 'sms' }
  ];

  const quickLoad = (preset) => {
    setEventType(preset.type);
    setMessage(preset.msg);
    setPriorityHint(preset.priority);
    setChannel(preset.ch);
  };

  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <h1>Event Simulator</h1>
      <p>Quickly generate test events to see the notification engine in action</p>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        
        {/* Form */}
        <div>
          <h3>Create Custom Event</h3>
          <form onSubmit={submit} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div>
              <label><strong>Event Type</strong></label>
              <input 
                type="text"
                value={eventType} 
                onChange={e=>setEventType(e.target.value)}
                placeholder="e.g. user.signup"
                disabled={loading}
              />
            </div>

            <div>
              <label><strong>Message</strong></label>
              <textarea 
                value={message} 
                onChange={e=>setMessage(e.target.value)}
                placeholder="Event description"
                disabled={loading}
                rows={3}
              />
            </div>

            <div>
              <label><strong>Priority Hint</strong></label>
              <select 
                value={priorityHint} 
                onChange={e=>setPriorityHint(e.target.value)}
                disabled={loading}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label><strong>Channel</strong></label>
              <select 
                value={channel} 
                onChange={e=>setChannel(e.target.value)}
                disabled={loading}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="internal">Internal</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>

            {error && <p style={{color:'red', margin: '8px 0'}}><strong>Error:</strong> {error}</p>}
            {success && <p style={{color:'green', margin: '8px 0'}}><strong>Success!</strong> {success}</p>}
          </form>
        </div>

        {/* Presets */}
        <div>
          <h3>Quick Presets</h3>
          <p style={{fontSize: '0.9em', color: '#666'}}>Click to load a preset event</p>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {presetEvents.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => quickLoad(preset)}
                disabled={loading}
                style={{
                  padding: '10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <strong>{preset.type}</strong>
                <br/>
                <small>{preset.msg}</small>
              </button>
            ))}
          </div>
        </div>

      </div>

      <div style={{marginTop: 30, padding: '15px', backgroundColor: '#f9f9f9', borderLeft: '4px solid #2196F3', borderRadius: '4px'}}>
        <h4>How it works:</h4>
        <ul style={{margin: '10px 0'}}>
          <li>Create a custom event or use a preset</li>
          <li>The event goes through the notification pipeline: deduplication → rule evaluation → AI classification</li>
          <li>Events classified as <strong>NOW</strong> are sent immediately</li>
          <li>Events classified as <strong>LATER</strong> are queued for batch processing</li>
          <li>Check the Events page to see your event appear in real-time via Socket.io</li>
        </ul>
      </div>
    </div>
  );
}
