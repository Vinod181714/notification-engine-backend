import { useState } from 'react';
import api from '../lib/api';

export default function RuleForm({ onCreated }){
  const [name, setName] = useState('');
  const [action, setAction] = useState('NOW');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e)=>{
    e.preventDefault();
    if (!name.trim()) {
      setError('Rule name is required');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/api/rules', { name, action });
      onCreated && onCreated(res.data);
      setName('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{marginBottom:12}}>
      <input 
        placeholder="Rule name" 
        value={name} 
        onChange={e=>setName(e.target.value)}
        disabled={loading}
      />
      <select 
        value={action} 
        onChange={e=>setAction(e.target.value)}
        disabled={loading}
      >
        <option>NOW</option>
        <option>LATER</option>
        <option>NEVER</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Rule'}
      </button>
      {error && <p style={{color:'red', marginTop:8}}>{error}</p>}
    </form>
  );
}
