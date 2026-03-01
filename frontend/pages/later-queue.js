import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function LaterQueue(){
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  useEffect(()=>{ api.get('/api/later-queue').then(r=>setItems(r.data.items||[])).catch(err=>setError(err.message)); },[]);
  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <h1>Later Queue</h1>
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      <ul>{items.map(i=> <li key={i._id}>{i.notification_id} - {i.status}</li>)}</ul>
    </div>
  );
}
