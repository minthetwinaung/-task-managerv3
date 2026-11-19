import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoginPage from './LoginPage';
import { getSession, validateSession } from './auth';

function Root() {
  const [user, setUser] = useState(getSession);

  // Drop a cached login whose Supabase auth session has expired or been removed.
  useEffect(() => {
    let cancelled = false;
    validateSession().then(valid => {
      if (!cancelled && !valid) setUser(null);
    });
    return () => { cancelled = true; };
  }, []);

  if (!user) return <LoginPage onAuth={setUser}/>;
  return <App user={user} onLogout={()=>setUser(null)}/>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><Root/></React.StrictMode>);
