import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';
import { useEffect, useState } from 'react';

export default function Header(){
  const { user, logout } = useAuth();
  const [socketStatus, setSocketStatus] = useState('disconnected');

  useEffect(() => {
    const s = getSocket();
    if (!s) {
      setSocketStatus('disconnected');
      return;
    }
    const onConnect = () => setSocketStatus('connected');
    const onDisconnect = () => setSocketStatus('disconnected');
    const onError = (err) => setSocketStatus('error');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);
    // set initial
    setSocketStatus(s.connected ? 'connected' : 'disconnected');
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onError);
    };
  }, [user]);
  return (
    <header style={{padding:12, borderBottom:'1px solid #eee', marginBottom:20}}>
      <nav style={{display:'flex', gap:12, alignItems:'center'}}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/events">Events</Link>
        <Link href="/simulator">Simulator</Link>
        <Link href="/rules">Rules</Link>
        <Link href="/audit">Audit</Link>
        <Link href="/metrics">Metrics</Link>
        <Link href="/later-queue">Later Queue</Link>
        <Link href="/health">Health</Link>
        {user ? (
          <>
            <span style={{marginLeft:12}}>Hi, {user.name || user.email}</span>
            <span style={{marginLeft:8, fontSize:12, color: socketStatus==='connected'?'green':'#666'}}>
              {socketStatus}
            </span>
            <button onClick={logout} style={{marginLeft:8}}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
