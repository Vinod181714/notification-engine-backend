import { useEffect, useState } from 'react';
import api from '../../lib/api';
import RuleForm from '../../components/RuleForm';

export default function Rules(){
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try {
        const res = await api.get('/api/rules');
        setRules(res.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load rules');
      } finally {
        setLoading(false);
      }
    };
    load();
  },[]);

  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <h1>Rules</h1>
      <RuleForm onCreated={(r)=>setRules(prev=>[r,...prev])} />
      {error && <p style={{color:'red'}}>{error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {rules.map(r=> <li key={r._id}><strong>{r.name}</strong> - {r.action}</li>)}
      </ul>
    </div>
  );
}
