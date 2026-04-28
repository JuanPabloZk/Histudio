import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { supabase } from './supabase.js'

function Root() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0A0A0F'}}>
      <div style={{fontFamily:"'Noto Sans JP',sans-serif",fontSize:'4rem',fontWeight:900,color:'#D94F3B',opacity:.3,animation:'spin 1.5s linear infinite'}}>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>あ
      </div>
    </div>
  )

  if (!session) return <AuthScreen />
  return <App supabase={supabase} userId={session.user.id} userEmail={session.user.email} />
}

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inp = {
    width:'100%',padding:'11px 14px',borderRadius:10,
    border:'1px solid rgba(255,255,255,.1)',
    background:'rgba(255,255,255,.06)',color:'#fff',
    fontSize:'.88rem',fontFamily:'inherit',outline:'none',
    transition:'border-color .15s',
  }

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options:{ data:{ name } } })
        if (error) throw error
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch(err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(160deg,#0A0A0F 0%,#12121C 60%,#0A0A0F 100%)',
      fontFamily:"'Outfit',sans-serif",padding:'20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        .auth-input:focus{border-color:rgba(217,79,59,.6)!important;background:rgba(217,79,59,.05)!important}
        .tab-btn:hover{background:rgba(255,255,255,.08)}
        .google-btn:hover{background:rgba(255,255,255,.1)!important}
        .submit-btn:hover{opacity:.92}
        .submit-btn:active{transform:scale(.98)}
      `}</style>

      {/* Background glows */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'20%',left:'30%',width:300,height:300,borderRadius:'50%',background:'#D94F3B',opacity:.04,filter:'blur(80px)'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'20%',width:250,height:250,borderRadius:'50%',background:'#3B82F6',opacity:.04,filter:'blur(80px)'}}/>
      </div>

      <div style={{width:'100%',maxWidth:400,position:'relative',zIndex:1}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{
            fontFamily:"'Noto Sans JP',sans-serif",
            fontSize:'4rem',fontWeight:900,color:'#D94F3B',lineHeight:1,
            textShadow:'0 0 40px rgba(217,79,59,.3)',
          }}>ひ</div>
          <div style={{fontSize:'1.15rem',fontWeight:800,color:'#fff',marginTop:8,letterSpacing:'-.3px'}}>Studio</div>
          <div style={{fontSize:'.76rem',color:'rgba(255,255,255,.3)',marginTop:4}}>Aprenda Japonês do zero ao N4</div>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,.04)',
          border:'1px solid rgba(255,255,255,.08)',
          borderRadius:20,padding:'28px 24px',
          backdropFilter:'blur(10px)',
        }}>

          {/* Tabs */}
          <div style={{display:'flex',background:'rgba(255,255,255,.05)',borderRadius:10,padding:3,marginBottom:22}}>
            {[['login','Entrar'],['signup','Criar conta']].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('')}} className="tab-btn" style={{
                flex:1,padding:'8px',borderRadius:8,border:'none',
                background:mode===m?'rgba(255,255,255,.12)':'transparent',
                color:mode===m?'#fff':'rgba(255,255,255,.35)',
                fontSize:'.82rem',fontWeight:mode===m?600:400,
                cursor:'pointer',fontFamily:'inherit',transition:'all .15s',
              }}>{l}</button>
            ))}
          </div>

          {/* Google OAuth button */}
          <button onClick={handleGoogle} disabled={googleLoading} className="google-btn" style={{
            width:'100%',padding:'11px 14px',marginBottom:16,
            background:'rgba(255,255,255,.07)',
            border:'1px solid rgba(255,255,255,.12)',
            borderRadius:10,cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            fontFamily:'inherit',transition:'background .15s',
          }}>
            {/* Google G icon */}
            {googleLoading ? (
              <span style={{fontSize:'13px',color:'rgba(255,255,255,.7)'}}>Redirecionando...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" style={{flexShrink:0}}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style={{fontSize:'.86rem',fontWeight:500,color:'rgba(255,255,255,.8)'}}>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.08)'}}/>
            <span style={{fontSize:'.72rem',color:'rgba(255,255,255,.25)',flexShrink:0}}>ou</span>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.08)'}}/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
            {mode==='signup' && (
              <div>
                <div style={{fontSize:'.72rem',fontWeight:500,color:'rgba(255,255,255,.4)',marginBottom:5}}>Nome</div>
                <input className="auth-input" style={inp} type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" required/>
              </div>
            )}
            <div>
              <div style={{fontSize:'.72rem',fontWeight:500,color:'rgba(255,255,255,.4)',marginBottom:5}}>Email</div>
              <input className="auth-input" style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/>
            </div>
            <div>
              <div style={{fontSize:'.72rem',fontWeight:500,color:'rgba(255,255,255,.4)',marginBottom:5}}>Senha</div>
              <input className="auth-input" style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6}/>
            </div>

            {error && <div style={{background:'rgba(239,68,68,.12)',border:'1px solid rgba(239,68,68,.25)',borderRadius:9,padding:'9px 12px',fontSize:'.76rem',color:'#FCA5A5'}}>⚠️ {error}</div>}
            {success && <div style={{background:'rgba(34,197,94,.12)',border:'1px solid rgba(34,197,94,.25)',borderRadius:9,padding:'9px 12px',fontSize:'.76rem',color:'#86EFAC'}}>✅ {success}</div>}

            <button type="submit" disabled={loading} className="submit-btn" style={{
              padding:'12px',borderRadius:10,border:'none',marginTop:4,
              background:loading?'rgba(217,79,59,.4)':'#D94F3B',
              color:'#fff',fontSize:'.88rem',fontWeight:600,
              cursor:loading?'not-allowed':'pointer',
              fontFamily:'inherit',transition:'all .15s',
              boxShadow:'0 4px 20px rgba(217,79,59,.25)',
            }}>
              {loading ? '...' : mode==='login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <div style={{textAlign:'center',marginTop:16,fontSize:'.68rem',color:'rgba(255,255,255,.15)'}}>
          Seus dados são protegidos · Supabase + RLS
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>)
