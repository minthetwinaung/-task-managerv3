import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Code2 } from 'lucide-react';
import { login, register } from './auth';
import { isSupabaseConfigured } from './supabaseClient';

export default function LoginPage({ onAuth }) {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [showP, setShowP]   = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = mode === 'login'
      ? await login(email, pass)
      : await register(name, email, pass);
    setLoading(false);
    if (res.ok) onAuth(res.user);
    else setError(res.error);
  };

  const inputStyle = {
    padding: '11px 14px', fontSize: 14, borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e6f0', outline: 'none', width: '100%',
    fontFamily: "'Sora', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#080b12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: "'Sora', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* background glow */}
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, background:'radial-gradient(circle, rgba(79,143,255,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'10%', width:400, height:400, background:'radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* grid pattern */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.35s ease both' }}>

        {/* logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'rgba(79,143,255,0.12)', border:'1px solid rgba(79,143,255,0.25)', borderRadius:14, marginBottom:14 }}>
            <Code2 size={24} color="#4f8fff"/>
          </div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#e2e6f0', letterSpacing:'-0.02em' }}>Dev Task Manager</h1>
          <p style={{ fontSize:13, color:'#5d6478', marginTop:5 }}>
            {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
          </p>
        </div>

        {/* card */}
        <div style={{ background:'rgba(14,17,24,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:18, padding:28, backdropFilter:'blur(20px)', boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>

          {/* tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3, marginBottom:24, border:'1px solid rgba(255,255,255,0.06)' }}>
            {[['login','Sign In'],['register','Register']].map(([v,l])=>(
              <button key={v} onClick={()=>{setMode(v);setError('');}}
                style={{ flex:1, padding:'8px', borderRadius:8, fontSize:13, fontWeight:500, background:mode===v?'rgba(79,143,255,0.18)':'transparent', color:mode===v?'#4f8fff':'#5d6478', border:'none', cursor:'pointer', transition:'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize:11, color:'#5d6478', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Full name</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Thet Win Aung" required style={inputStyle}
                  onFocus={e=>e.target.style.borderColor='#4f8fff'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
              </div>
            )}

            <div>
              <label style={{ fontSize:11, color:'#5d6478', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                onFocus={e=>e.target.style.borderColor='#4f8fff'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
            </div>

            <div>
              <label style={{ fontSize:11, color:'#5d6478', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showP?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required style={{...inputStyle, paddingRight:42}}
                  onFocus={e=>e.target.style.borderColor='#4f8fff'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
                <button type="button" onClick={()=>setShowP(s=>!s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'#5d6478', display:'flex', cursor:'pointer', padding:2 }}>
                  {showP ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding:'9px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, fontSize:12, color:'#f87171' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop:4, padding:'11px', borderRadius:10, background: loading?'rgba(79,143,255,0.5)':'rgba(79,143,255,1)', color:'#fff', fontSize:14, fontWeight:600, border:'none', cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s', boxShadow: loading?'none':'0 4px 20px rgba(79,143,255,0.35)' }}>
              {loading
                ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>
                : mode==='login' ? <><LogIn size={15}/> Sign In</> : <><UserPlus size={15}/> Create Account</>}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div style={{ marginTop:18, padding:'12px 14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, color:'#f87171', fontSize:12, textAlign:'center' }}>
              Supabase is not configured, so this app is using local browser storage only.
            </div>
          )}

          {/* demo hint */}
          <div style={{ marginTop:20, padding:'10px 12px', background:'rgba(79,143,255,0.06)', border:'1px solid rgba(79,143,255,0.15)', borderRadius:8, fontSize:11, color:'#4f8fff', textAlign:'center' }}>
            💡 Register with any email & password to get started
          </div>
        </div>
      </div>
    </div>
  );
}
