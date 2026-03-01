import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function EventDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    if(!id) return;
    api.get('/api/events?limit=1&page=1').then(res=>{
      const found = res.data.items.find(x=>x._id===id);
      setEvent(found||null);
    }).catch(err=>setError(err.message));
  },[id]);

  if(error) return <div style={{maxWidth:800, margin:'20px auto', color:'red'}}>Error: {error}</div>;
  if(!event) return <div style={{maxWidth:800, margin:'20px auto'}}>Event not found</div>;
  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <h1>{event.title || event.event_type}</h1>
      <p>{event.message}</p>
      <pre>{JSON.stringify(event, null, 2)}</pre>
    </div>
  );
}
