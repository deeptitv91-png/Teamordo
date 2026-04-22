import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCompany } from '../../firebase/firestore'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Notify from '../../components/common/Notify'

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    price:    0,
    display:  '₹0',
    period:   '/month',
    members:  10,
    depts:    1,
    color:    '#888',
    bg:       '#F1EFE8',
    features: ['Up to 10 members', '1 department', 'Task management', 'Two-level approvals', 'Work submissions', 'Basic reports'],
  },
  {
    id:       'starter',
    name:     'Starter',
    price:    99900,
    display:  '₹999',
    period:   '/month',
    members:  50,
    depts:    5,
    color:    '#0C447C',
    bg:       '#E6F1FB',
    features: ['Up to 50 members', '5 departments', 'Everything in Free', 'Advanced reports', 'PDF export', 'Priority support'],
  },
  {
    id:       'growth',
    name:     'Growth',
    price:    150000,
    display:  '₹1,500',
    period:   '/month',
    members:  100,
    depts:    10,
    color:    '#27500A',
    bg:       '#EAF3DE',
    popular:  true,
    features: ['Up to 100 members', '10 departments', 'Everything in Starter', 'Unlimited tasks', 'Performance analytics', 'Dedicated support'],
  },
  {
    id:       'enterprise',
    name:     'Enterprise',
    price:    0,
    display:  'Custom',
    period:   '',
    members:  999,
    depts:    999,
    color:    '#3C3489',
    bg:       '#EEEDFE',
    features: ['Unlimited members', 'Unlimited departments', 'Everything in Growth', 'Custom onboarding', 'SLA guarantee', 'Account manager'],
  },
]

const RAZORPAY_KEY_ID = 'rzp_live_SXWNSGanGVUwBt'

const UpgradePlan = () => {
  const { user }   = useAuth()
  const [company,  setCompany]  = useState(null)
  const [notify,   setNotify]   = useState(null)
  const [paying,   setPaying]   = useState(false)

  useEffect(() => {
    if (user) getCompany(user.companyId).then(setCompany)
  }, [user])

  const currentPlan = PLANS.find(p => p.id === (company?.plan || 'free')) || PLANS[0]

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleUpgrade = async (plan) => {
    if (plan.id === 'free') {
      setNotify({ msg:'You are already on the Free plan or contact support to downgrade.', type:'warn' })
      return
    }
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:contact@teamordo.com?subject=Enterprise Plan Enquiry&body=Company: ' + company?.name + '%0ACompany ID: ' + user?.companyId
      return
    }
    if (plan.id === currentPlan.id) {
      setNotify({ msg:'You are already on this plan!', type:'warn' })
      return
    }

    setPaying(true)
    const loaded = await loadRazorpay()
    if (!loaded) {
      setNotify({ msg:'Payment gateway failed to load. Please try again.', type:'err' })
      setPaying(false)
      return
    }

    const options = {
      key:         RAZORPAY_KEY_ID,
      amount:      plan.price,
      currency:    'INR',
      name:        'Teamordo',
      description: plan.name + ' Plan — Monthly',
      image:       'https://teamordo.com/favicon.ico',
      prefill: {
        name:  company?.name,
        email: company?.adminEmail,
      },
      notes: {
        companyId: user?.companyId,
        planId:    plan.id,
      },
      theme: { color: '#378ADD' },
      handler: async (response) => {
        // Payment successful — update plan in Firebase
        try {
          await updateDoc(doc(db, 'companies', user.companyId), {
            plan:              plan.id,
            planUpdatedAt:     new Date().toISOString(),
            lastPaymentId:     response.razorpay_payment_id,
            lastPaymentAmount: plan.price,
          })
          setCompany(prev => ({ ...prev, plan: plan.id }))
          setNotify({ msg:'Plan upgraded to ' + plan.name + ' successfully! Payment ID: ' + response.razorpay_payment_id, type:'ok' })
        } catch (err) {
          setNotify({ msg:'Payment received but plan update failed. Contact support with Payment ID: ' + response.razorpay_payment_id, type:'err' })
        }
        setPaying(false)
      },
      modal: {
        ondismiss: () => setPaying(false)
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      setNotify({ msg:'Payment failed: ' + response.error.description, type:'err' })
      setPaying(false)
    })
    rzp.open()
  }

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'18px', fontWeight:500, marginBottom:'4px' }}>Plans & billing</div>
        <div style={{ fontSize:'13px', color:'#888' }}>
          Current plan: <span style={{ fontWeight:600, color: currentPlan.color }}>{currentPlan.name}</span>
          {company?.lastPaymentId && <span style={{ marginLeft:'12px', fontSize:'11px', color:'#aaa' }}>Last payment ID: {company.lastPaymentId}</span>}
        </div>
      </div>

      {notify && <Notify message={notify.msg} type={notify.type} onDone={() => setNotify(null)} />}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px' }}>
        {PLANS.map(plan => {
          const isCurrent = plan.id === (company?.plan || 'free')
          const isDowngrade = PLANS.indexOf(plan) < PLANS.indexOf(currentPlan)
          return (
            <div key={plan.id} style={{
              background: '#fff',
              border: isCurrent ? `2px solid ${plan.color}` : plan.popular ? '2px solid #378ADD' : '0.5px solid rgba(0,0,0,0.1)',
              borderRadius:'14px',
              padding:'24px',
              position:'relative',
            }}>
              {plan.popular && !isCurrent && (
                <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#378ADD', color:'#fff', fontSize:'11px', fontWeight:600, padding:'4px 14px', borderRadius:'20px', whiteSpace:'nowrap' }}>
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background: plan.color, color:'#fff', fontSize:'11px', fontWeight:600, padding:'4px 14px', borderRadius:'20px', whiteSpace:'nowrap' }}>
                  CURRENT PLAN
                </div>
              )}

              <div style={{ fontSize:'15px', fontWeight:600, color:'#1a1a1a', marginBottom:'6px' }}>{plan.name}</div>
              <div style={{ marginBottom:'16px' }}>
                <span style={{ fontSize:'28px', fontWeight:700, color:'#1a1a1a' }}>{plan.display}</span>
                <span style={{ fontSize:'13px', color:'#888' }}>{plan.period}</span>
              </div>

              <div style={{ marginBottom:'16px', paddingBottom:'16px', borderBottom:'0.5px solid rgba(0,0,0,0.08)' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'50%', background: plan.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:'9px', color: plan.color, fontWeight:700 }}>✓</span>
                    </div>
                    <span style={{ fontSize:'12px', color:'#555' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={paying || isCurrent || isDowngrade}
                style={{
                  width:'100%', padding:'10px', fontSize:'13px', fontWeight:500,
                  background: isCurrent ? plan.bg : isDowngrade ? '#f5f5f5' : plan.id === 'enterprise' ? '#1a1a1a' : '#378ADD',
                  color: isCurrent ? plan.color : isDowngrade ? '#aaa' : '#fff',
                  border:'none', borderRadius:'8px',
                  cursor: (paying || isCurrent || isDowngrade) ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit',
                  opacity: paying ? 0.7 : 1,
                }}
              >
                {isCurrent ? 'Current plan' : isDowngrade ? 'Contact support' : plan.id === 'enterprise' ? 'Contact us' : paying ? 'Processing...' : 'Upgrade to ' + plan.name}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop:'20px', padding:'14px 16px', background:'#F8F8F6', borderRadius:'10px', fontSize:'12px', color:'#888' }}>
        Payments are processed securely via Razorpay. Plans are billed monthly. For downgrades or cancellations, contact support at contact@teamordo.com
      </div>
    </div>
  )
}

export default UpgradePlan
