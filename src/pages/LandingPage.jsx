import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const LandingPage = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const features = [
    { icon: '◈', title: 'Role-based access', desc: 'Manager, Lead, Executive, Trainee — every role gets exactly what they need. Nothing more, nothing less.' },
    { icon: '◎', title: 'Two-level approvals', desc: 'Every task goes through a structured approval chain. L1 from any lead, L2 from the task creator. Full accountability.' },
    { icon: '◉', title: 'Work submissions', desc: 'Team members submit work links for review. Approve, request correction, or ask for rework — all in one place.' },
    { icon: '▣', title: 'Department management', desc: 'Create departments, generate secure IDs for heads, and manage your entire org structure from one admin panel.' },
    { icon: '◫', title: 'Performance reports', desc: 'Daily, weekly, monthly, yearly reports. Track completion rates, delays, approval times, and team scores.' },
    { icon: '◬', title: 'PDF export', desc: 'Download any report as a professional PDF. Share with stakeholders, clients, or keep for your records.' },
  ]

  const steps = [
    { num: '01', title: 'Register your company', desc: 'Sign up in 2 minutes. Get your unique Company ID instantly.' },
    { num: '02', title: 'Set up departments', desc: 'Create departments and share secure login IDs with your department heads.' },
    { num: '03', title: 'Add your team', desc: 'Department heads add members with auto-generated IDs and passwords.' },
    { num: '04', title: 'Start working', desc: 'Assign tasks, track progress, approve work — all from one clean dashboard.' },
  ]

  const plans = [
    { name: 'Free', price: '₹0', period: '/month', members: 'Up to 10 members', depts: '1 department', features: ['Task management', 'Two-level approvals', 'Work submissions', 'Basic reports'], cta: 'Get started free', highlight: false },
    { name: 'Starter', price: '₹999', period: '/month', members: 'Up to 50 members', depts: '5 departments', features: ['Everything in Free', 'Advanced reports', 'PDF export', 'Priority support'], cta: 'Start free trial', highlight: false },
    { name: 'Growth', price: '₹1,500', period: '/month', members: 'Up to 100 members', depts: '10 departments', features: ['Everything in Starter', 'Unlimited tasks', 'Performance analytics', 'Dedicated support'], cta: 'Start free trial', highlight: true },
    { name: 'Enterprise', price: 'Custom', period: '', members: '100+ members', depts: 'Unlimited departments', features: ['Everything in Growth', 'Custom onboarding', 'SLA guarantee', 'Account manager'], cta: 'Contact us', highlight: false },
  ]

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color:'#1a1a1a', background:'#fff' }}>

      {/* NAV */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '0.5px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s',
        padding:'0 5%',
      }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:'64px' }}>
          <div style={{ fontSize:'20px', fontWeight:600, letterSpacing:'-0.02em' }}>
            Team<span style={{ color:'#378ADD' }}>ordo</span>
          </div>
          <div style={{ display:'flex', gap:'32px', alignItems:'center' }}>
            {['Features','How it works','Pricing','Contact'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase().replace(' ','-'))} style={{ background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>
                {item}
              </button>
            ))}
            <button onClick={() => navigate('/login')} style={{ background:'none', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', cursor:'pointer', fontFamily:'inherit', color:'#333' }}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={{ background:'#1a1a1a', border:'none', borderRadius:'8px', padding:'7px 18px', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:'inherit', color:'#fff' }}>
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'120px 5% 80px', background:'linear-gradient(180deg, #f8f9ff 0%, #fff 100%)' }}>
        <div style={{ maxWidth:'780px', margin:'0 auto' }}>
          <div style={{ display:'inline-block', background:'#EEF4FF', color:'#378ADD', fontSize:'12px', fontWeight:500, padding:'5px 14px', borderRadius:'20px', marginBottom:'24px', letterSpacing:'0.04em' }}>
            PROJECT MANAGEMENT · REIMAGINED
          </div>
          <h1 style={{ fontSize:'clamp(36px,5vw,64px)', fontWeight:700, lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:'20px', color:'#0a0a0a' }}>
            One platform.<br />Every team.<br /><span style={{ color:'#378ADD' }}>Total clarity.</span>
          </h1>
          <p style={{ fontSize:'18px', color:'#666', lineHeight:1.7, marginBottom:'36px', maxWidth:'560px', margin:'0 auto 36px' }}>
            Teamordo brings your entire organisation into one structured workspace — tasks, approvals, work reviews and performance reports, all in one place.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'10px', padding:'14px 28px', fontSize:'15px', fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              Start for free
            </button>
            <button onClick={() => scrollTo('how-it-works')} style={{ background:'transparent', color:'#333', border:'0.5px solid rgba(0,0,0,0.2)', borderRadius:'10px', padding:'14px 28px', fontSize:'15px', cursor:'pointer', fontFamily:'inherit' }}>
              See how it works
            </button>
          </div>
          <div style={{ marginTop:'48px', display:'flex', gap:'32px', justifyContent:'center', flexWrap:'wrap' }}>
            {[['Free to start','No credit card needed'],['10 min setup','Be live today'],['Any industry','Works for all teams']].map(([title,sub]) => (
              <div key={title} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'14px', fontWeight:500, color:'#1a1a1a' }}>{title}</div>
                <div style={{ fontSize:'12px', color:'#999', marginTop:'2px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:'100px 5%', background:'#fff' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'60px' }}>
            <div style={{ fontSize:'12px', fontWeight:500, color:'#378ADD', letterSpacing:'0.08em', marginBottom:'12px' }}>FEATURES</div>
            <h2 style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:700, letterSpacing:'-0.02em', color:'#0a0a0a' }}>Everything your team needs</h2>
            <p style={{ fontSize:'16px', color:'#888', marginTop:'12px' }}>Built for real workflows, not just task lists.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'24px' }}>
            {features.map(f => (
              <div key={f.title} style={{ background:'#f8f9ff', borderRadius:'16px', padding:'28px', border:'0.5px solid #eef' }}>
                <div style={{ fontSize:'24px', marginBottom:'14px', color:'#378ADD' }}>{f.icon}</div>
                <div style={{ fontSize:'16px', fontWeight:600, marginBottom:'8px', color:'#0a0a0a' }}>{f.title}</div>
                <div style={{ fontSize:'14px', color:'#666', lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:'100px 5%', background:'#0a0a0a' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'60px' }}>
            <div style={{ fontSize:'12px', fontWeight:500, color:'#378ADD', letterSpacing:'0.08em', marginBottom:'12px' }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:700, letterSpacing:'-0.02em', color:'#fff' }}>Up and running in minutes</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'32px' }}>
            {steps.map(s => (
              <div key={s.num} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'48px', fontWeight:700, color:'#378ADD', opacity:0.3, marginBottom:'12px', fontVariantNumeric:'tabular-nums' }}>{s.num}</div>
                <div style={{ fontSize:'16px', fontWeight:600, color:'#fff', marginBottom:'8px' }}>{s.title}</div>
                <div style={{ fontSize:'14px', color:'#666', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:'100px 5%', background:'#f8f9ff' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'60px' }}>
            <div style={{ fontSize:'12px', fontWeight:500, color:'#378ADD', letterSpacing:'0.08em', marginBottom:'12px' }}>PRICING</div>
            <h2 style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:700, letterSpacing:'-0.02em', color:'#0a0a0a' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize:'16px', color:'#888', marginTop:'12px' }}>Start free. Upgrade as your team grows.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'20px' }}>
            {plans.map(p => (
              <div key={p.name} style={{
                background: p.highlight ? '#1a1a1a' : '#fff',
                borderRadius:'16px',
                padding:'32px 24px',
                border: p.highlight ? 'none' : '0.5px solid #e8e8f0',
                position:'relative',
              }}>
                {p.highlight && (
                  <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#378ADD', color:'#fff', fontSize:'11px', fontWeight:600, padding:'4px 14px', borderRadius:'20px', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize:'15px', fontWeight:600, color: p.highlight?'#fff':'#0a0a0a', marginBottom:'8px' }}>{p.name}</div>
                <div style={{ marginBottom:'16px' }}>
                  <span style={{ fontSize:'32px', fontWeight:700, color: p.highlight?'#fff':'#0a0a0a' }}>{p.price}</span>
                  <span style={{ fontSize:'14px', color: p.highlight?'#aaa':'#888' }}>{p.period}</span>
                </div>
                <div style={{ fontSize:'13px', color: p.highlight?'#aaa':'#666', marginBottom:'4px' }}>{p.members}</div>
                <div style={{ fontSize:'13px', color: p.highlight?'#aaa':'#666', marginBottom:'20px' }}>{p.depts}</div>
                <div style={{ borderTop:`0.5px solid ${p.highlight?'#2a2a2a':'#f0f0f8'}`, paddingTop:'20px', marginBottom:'24px' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                      <div style={{ width:'16px', height:'16px', borderRadius:'50%', background: p.highlight?'#378ADD':'#EEF4FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:'9px', color: p.highlight?'#fff':'#378ADD', fontWeight:700 }}>✓</span>
                      </div>
                      <span style={{ fontSize:'13px', color: p.highlight?'#ccc':'#555' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => p.name === 'Enterprise' ? scrollTo('contact') : navigate('/register')}
                  style={{
                    width:'100%', padding:'11px', fontSize:'13px', fontWeight:500,
                    background: p.highlight ? '#378ADD' : 'transparent',
                    color: p.highlight ? '#fff' : '#1a1a1a',
                    border: p.highlight ? 'none' : '0.5px solid rgba(0,0,0,0.2)',
                    borderRadius:'8px', cursor:'pointer', fontFamily:'inherit',
                  }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding:'100px 5%', background:'#fff' }}>
        <div style={{ maxWidth:'600px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'12px', fontWeight:500, color:'#378ADD', letterSpacing:'0.08em', marginBottom:'12px' }}>CONTACT</div>
          <h2 style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:700, letterSpacing:'-0.02em', color:'#0a0a0a', marginBottom:'12px' }}>Get in touch</h2>
          <p style={{ fontSize:'16px', color:'#888', marginBottom:'40px' }}>Have questions? We'd love to hear from you.</p>
          <div style={{ background:'#f8f9ff', borderRadius:'16px', padding:'40px', border:'0.5px solid #eef' }}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0a0a0a', padding:'40px 5%' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <div style={{ fontSize:'18px', fontWeight:600, color:'#fff' }}>Team<span style={{ color:'#378ADD' }}>ordo</span></div>
          <div style={{ fontSize:'13px', color:'#555' }}>© 2026 Teamordo. All rights reserved.</div>
          <div style={{ display:'flex', gap:'20px' }}>
            <button onClick={() => navigate('/login')} style={{ background:'none', border:'none', fontSize:'13px', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Login</button>
            <button onClick={() => navigate('/register')} style={{ background:'none', border:'none', fontSize:'13px', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Register</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

const ContactForm = () => {
  const [form, setForm] = useState({ name:'', email:'', message:'' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    window.location.href = `mailto:contact@teamordo.com?subject=Enquiry from ${form.name}&body=${form.message}%0A%0AFrom: ${form.name}%0AEmail: ${form.email}`
    setSent(true)
  }

  if (sent) return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ fontSize:'32px', marginBottom:'12px' }}>✓</div>
      <div style={{ fontSize:'16px', fontWeight:500, color:'#27500A' }}>Message sent!</div>
      <div style={{ fontSize:'13px', color:'#888', marginTop:'6px' }}>We'll get back to you soon.</div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      {[
        { key:'name',    label:'Your name',    placeholder:'e.g. Rahul Sharma',          type:'text' },
        { key:'email',   label:'Email address',placeholder:'rahul@yourcompany.com',       type:'email' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom:'14px', textAlign:'left' }}>
          <label style={{ fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>{f.label}</label>
          <input type={f.type} style={{ width:'100%', padding:'10px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box', background:'#fff' }} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} />
        </div>
      ))}
      <div style={{ marginBottom:'20px', textAlign:'left' }}>
        <label style={{ fontSize:'11px', fontWeight:500, color:'#666', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Message</label>
        <textarea style={{ width:'100%', padding:'10px 12px', fontSize:'13px', border:'0.5px solid rgba(0,0,0,0.15)', borderRadius:'8px', fontFamily:'inherit', boxSizing:'border-box', height:'100px', resize:'none', background:'#fff' }} placeholder="Tell us about your team and what you need..." value={form.message} onChange={e => setForm(p=>({...p,message:e.target.value}))} />
      </div>
      <button type="submit" style={{ width:'100%', padding:'12px', fontSize:'14px', fontWeight:500, background:'#1a1a1a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit' }}>
        Send message
      </button>
    </form>
  )
}

export default LandingPage
