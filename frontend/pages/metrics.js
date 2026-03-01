import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Metrics(){
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(()=>{ api.get('/api/metrics').then(r=>setData(r.data)).catch(err=>setError(err.message)); },[]);
  if(error) return <div style={{maxWidth:900, margin:'24px auto', color:'red'}}>Error: {error}</div>;
  if(!data) return <div style={{maxWidth:900, margin:'24px auto'}}>Loading metrics...</div>;
  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <h1>Metrics</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
