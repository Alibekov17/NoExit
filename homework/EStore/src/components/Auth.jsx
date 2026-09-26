import { useState } from 'react'
import { supabase } from '../Supabase'

export default function Auth() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1: Ввод телефона, 2: Ввод кода
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' }) // type: 'info' | 'error' | 'success'

  // 1. Отправка кода по номеру телефона через Telegram Edge Function
  const handleSendCode = async (e) => {
    e.preventDefault()
    const cleanPhone = phone.trim().replace(/[^\d+]/g, '')
    
    if (!cleanPhone) {
      setMessage({ text: 'Пожалуйста, введите корректный номер телефона', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: 'Отправляем код в Telegram...', type: 'info' })

    try {
      const { error } = await supabase.functions.invoke('send-telegram-otp', {
        body: { phone: cleanPhone },
      })
      if (error) throw error

      setStep(2)
      setMessage({ text: 'Код отправлен в ваш Telegram!', type: 'success' })
    } catch (err) {
      console.error('Ошибка отправки:', err.message)
      setMessage({ 
        text: `Ошибка при отправке: ${err.message || 'Не удалось отправить код'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // 2. Проверка одноразового кода
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    const cleanPhone = phone.trim().replace(/[^\d+]/g, '')
    setLoading(true)
    setMessage({ text: 'Проверяем код...', type: 'info' })

    try {
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('id')
        .eq('phone_number', cleanPhone)
        .eq('code', code.trim())
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      if (otpError) throw otpError

      if (!otpData || otpData.length === 0) {
        setMessage({ text: 'Неверный или истекший код!', type: 'error' })
      } else {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .upsert({ phone_number: cleanPhone }, { onConflict: 'phone_number' })
          .select()
          .single()
        if (profileError) throw profileError

        // Сохраняем сессию локально
        localStorage.setItem('user_session', JSON.stringify(userProfile))
        setMessage({ text: 'Успешная авторизация! Добро пожаловать.', type: 'success' })
        
        // Тут можно перенаправить пользователя: navigate('/dashboard')
      }
    } catch (err) {
      console.error('Ошибка проверки:', err.message)
      setMessage({ text: `Ошибка проверки: ${err.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Сброс и возврат на 1-й шаг
  const handleReset = () => {
    setStep(1)
    setCode('')
    setMessage({ text: '', type: '' })
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Авторизация по номеру телефона</h2>

      {step === 1 ? (
        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label htmlFor="phone">Номер телефона Telegram:</label>
          <input
            id="phone"
            type="tel"
            placeholder="+79991234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            required
            style={{ padding: '8px', fontSize: '16px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
            {loading ? 'Отправка...' : 'Получить код в Telegram'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label htmlFor="code">
            Введите 6-значный код из Telegram:
          </label>
          <input
            id="code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            required
            style={{ padding: '8px', fontSize: '16px', letterSpacing: '2px', textAlign: 'center' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
            {loading ? 'Проверка...' : 'Войти'}
          </button>
          
          <button 
            type="button" 
            onClick={handleReset} 
            disabled={loading}
            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer' }}
          >
            ← Ввести другой номер
          </button>
        </form>
      )}

      {message.text && (
        <div style={{ 
          marginTop: '16px', 
          padding: '10px', 
          borderRadius: '4px',
          color: message.type === 'error' ? '#721c24' : message.type === 'success' ? '#155724' : '#0c5460',
          backgroundColor: message.type === 'error' ? '#f8d7da' : message.type === 'success' ? '#d4edda' : '#d1ecf1'
        }}>
          {message.text}
        </div>
      )}
    </div>
  )
}