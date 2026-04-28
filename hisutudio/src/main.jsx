import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { supabase } from './supabase.js'

/* ── ROOT ── */
function Root() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <Splash />
  if (!session) return <AuthScreen />
  return <App supabase={supabase} userId={session.user.id} userEmail={session.user.email} />
}

/* ── SPLASH ── */
function Splash() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A0F'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.8}}'}</style>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:"'Noto Sans JP',sans-serif",fontSize:'5rem',fontWeight:900,color:'#D94F3B',animation:'spin 2s linear infinite,pulse 2s ease infinite'}}>ひ</div>
        <div style={{color:'rgba(255,255,255,.3)',fontSize:'.8rem',marginTop:12,fontFamily:'sans-serif'}}>Carregando...</div>
      </div>
    </div>
  )
}

/* ── AUTH SCREEN ── */
function AuthScreen() {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoad]  = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleGoogle = async () => {
    setGLoad(true); reset()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setGLoad(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); reset()
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password: pass, options: { data: { name } }
        })
        if (error) throw error
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) throw error
      }
    } catch(err) {
      const msgs = {
        'Invalid login credentials': 'Email ou senha incorretos.',
        'Email not confirmed': 'Confirme seu email antes de entrar.',
        'User already registered': 'Este email já está cadastrado.',
      }
      setError(msgs[err.message] || err.message)
    } finally { setLoading(false) }
  }

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:10,
    border:'1.5px solid rgba(255,255,255,.1)',
    background:'rgba(255,255,255,.05)', color:'#fff',
    fontSize:'15px', fontFamily:'inherit', outline:'none',
    transition:'border-color .15s',
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#07070D 0%,#0F0F1A 60%,#07070D 100%)',
      fontFamily:'"Outfit",system-ui,sans-serif', padding:'20px',
      position:'relative', overflow:'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .ai:focus{border-color:rgba(217,79,59,.7)!important;background:rgba(217,79,59,.06)!important}
        .gb:hover{background:rgba(255,255,255,.11)!important;border-color:rgba(255,255,255,.2)!important}
        .sb:hover:not(:disabled){background:#C0392B!important}
        .sb:active:not(:disabled){transform:scale(.98)}
        .tab:hover{background:rgba(255,255,255,.06)}
      `}</style>

      {/* Ambient glows */}
      <div style={{position:'fixed',top:'15%',left:'20%',width:350,height:350,borderRadius:'50%',background:'#D94F3B',opacity:.05,filter:'blur(90px)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:'15%',right:'15%',width:280,height:280,borderRadius:'50%',background:'#3B82F6',opacity:.04,filter:'blur(90px)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:400,position:'relative',zIndex:1}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{
            fontFamily:"'Noto Sans JP',sans-serif",
            fontSize:'56px',fontWeight:900,color:'#D94F3B',lineHeight:1,
            filter:'drop-shadow(0 0 24px rgba(217,79,59,.35))',
          }}>ひ</div>
          <div style={{fontSize:'18px',fontWeight:800,color:'#fff',marginTop:10,letterSpacing:'-.4px'}}>Studio</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.28)',marginTop:5}}>Aprenda Japonês · do zero ao N4</div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,.03)',
          border:'1px solid rgba(255,255,255,.07)',
          borderRadius:22, padding:'28px 24px',
        }}>

          {/* Tabs */}
          <div style={{display:'flex',background:'rgba(255,255,255,.05)',borderRadius:11,padding:3,marginBottom:22,gap:3}}>
            {[['login','Entrar'],['signup','Criar conta']].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);reset()}} className="tab" style={{
                flex:1,padding:'8px',borderRadius:9,border:'none',
                background:mode===m?'rgba(255,255,255,.11)':'transparent',
                color:mode===m?'#fff':'rgba(255,255,255,.32)',
                fontSize:'14px',fontWeight:mode===m?600:400,
                cursor:'pointer',fontFamily:'inherit',transition:'all .15s',
              }}>{l}</button>
            ))}
          </div>

          {/* Google button */}
          <button onClick={handleGoogle} disabled={gLoading} className="gb" style={{
            width:'100%',padding:'12px 14px',marginBottom:18,
            background:'rgba(255,255,255,.06)',
            border:'1px solid rgba(255,255,255,.1)',
            borderRadius:11,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            fontFamily:'inherit',transition:'all .15s',
          }}>
            {gLoading ? (
              <span style={{fontSize:'14px',color:'rgba(255,255,255,.6)'}}>Redirecionando...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style={{fontSize:'14px',fontWeight:500,color:'rgba(255,255,255,.75)'}}>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.07)'}}/>
            <span style={{fontSize:'12px',color:'rgba(255,255,255,.22)'}}>ou continue com email</span>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.07)'}}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:13}}>
            {mode==='signup' && (
              <div>
                <div style={{fontSize:'12px',fontWeight:500,color:'rgba(255,255,255,.35)',marginBottom:6}}>Nome</div>
                <input className="ai" style={inp} type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" required/>
              </div>
            )}
            <div>
              <div style={{fontSize:'12px',fontWeight:500,color:'rgba(255,255,255,.35)',marginBottom:6}}>Email</div>
              <input className="ai" style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/>
            </div>
            <div>
              <div style={{fontSize:'12px',fontWeight:500,color:'rgba(255,255,255,.35)',marginBottom:6}}>Senha</div>
              <input className="ai" style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6}/>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',borderRadius:9,padding:'10px 13px',fontSize:'13px',color:'#FCA5A5',display:'flex',alignItems:'center',gap:8}}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            {success && (
              <div style={{background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.2)',borderRadius:9,padding:'10px 13px',fontSize:'13px',color:'#86EFAC',display:'flex',alignItems:'center',gap:8}}>
                <span>✅</span><span>{success}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="sb" style={{
              padding:'13px', borderRadius:11, border:'none', marginTop:2,
              background:loading?'rgba(217,79,59,.35)':'#D94F3B',
              color:'#fff', fontSize:'15px', fontWeight:600,
              cursor:loading?'not-allowed':'pointer',
              fontFamily:'inherit', transition:'all .15s',
              boxShadow:loading?'none':'0 4px 20px rgba(217,79,59,.3)',
            }}>
              {loading ? '...' : mode==='login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
)
