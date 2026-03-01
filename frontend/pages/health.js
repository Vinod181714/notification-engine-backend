import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Health(){
  const [h, setH] = useState(null);
  const [error, setError] = useState(null);
  useEffect(()=>{ api.get('/api/health').then(r=>setH(r.data)).catch(err=>setError(err.message)); },[]);
  if(error) return <div style={{maxWidth:800, margin:'20px auto', color:'red'}}>Error: {error}</div>;
  if(!h) return <div style={{maxWidth:800, margin:'20px auto'}}>Loading...</div>;
  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <h1>Health</h1>
      <pre>{JSON.stringify(h, null, 2)}</pre>
    </div>
  );
}
