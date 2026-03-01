import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@cyepro.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const router = useRouter();

  const { login } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/login`, { email, password });
      // use AuthContext to store token and load user
      await login(res.data.token);
      router.push('/events');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{maxWidth:600, margin:'40px auto'}}>
      <h1>Login</h1>
      
      <div style={{
        backgroundColor: '#f0f8ff',
        border: '2px dashed #4CAF50',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        <p><strong>Demo Credentials:</strong></p>
        <p style={{margin: '8px 0'}}>
          <strong>Admin:</strong> admin@cyepro.com / admin123
        </p>
        <p style={{margin: '8px 0'}}>
          <strong>Operator:</strong> operator@cyepro.com / operator123
        </p>
      </div>

      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{color:'red'}}>{error}</p>}
      </form>
    </div>
  );
}
