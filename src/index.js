import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoginPage from './LoginPage';
import { getSession } from './auth';

function Root() {
  const [user, setUser] = useState(getSession);
  if (!user) return <LoginPage onAuth={setUser}/>;
  return <App user={user} onLogout={()=>setUser(null)}/>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><Root/></React.StrictMode>);
