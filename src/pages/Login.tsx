import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chrome, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import Swal from 'sweetalert2'

export default function Login() {
  const navigate = useNavigate()
  const { login, register, loginWithGoogle } = useAuthStore()

  const [isLoginTab, setIsLoginTab] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      await login(email, password)
      Swal.fire({
        title: '¡Bienvenido de vuelta!',
        text: 'Sesión iniciada con éxito.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
      navigate('/')
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      await register(email, password, firstName, lastName, phone)
      Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'Tu perfil ha sido creado con éxito.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#121422',
        color: '#f1f3f9'
      })
      navigate('/')
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrarse.')
    }
  }

  const handleOAuthLogin = async (provider: string) => {
    try {
      await loginWithGoogle()
      Swal.fire({
        title: 'Sesión OAuth Iniciada',
        text: 'Conectado con tu cuenta de Google.',
        icon: 'success',
        background: '#121422',
        color: '#f1f3f9',
        timer: 1500,
        showConfirmButton: false
      })
      navigate('/')
    } catch (err: any) {
      Swal.fire({
        title: 'Error de Autenticación',
        text: err.message || 'No se pudo iniciar sesión con Google.',
        icon: 'error',
        background: '#121422',
        color: '#f1f3f9'
      })
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md bg-[#121422] rounded-2xl border border-white/5 shadow-neon-pink overflow-hidden">

        {/* Tab selector */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${isLoginTab ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-geek-muted'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-all ${!isLoginTab ? 'bg-secondary/10 text-secondary border-b-2 border-secondary' : 'text-geek-muted'
              }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8">

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-geek-muted uppercase tracking-wider">Contraseña</label>
                  <a href="#" className="text-xs text-secondary hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none focus:border-primary transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-neon-pink transition flex justify-center items-center"
              >
                Conectarse
              </button>

              <div className="text-center text-[10px] text-geek-muted">
                Tip: Usa correo user@gmail.com
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider mb-1.5">Nombre</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Luffy"
                    className="w-full px-3 py-2 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider mb-1.5">Apellido</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Monkey"
                    className="w-full px-3 py-2 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="otaku@correo.com"
                  className="w-full px-3 py-2 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider mb-1.5">Celular / Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987654321"
                  className="w-full px-3 py-2 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-geek-muted uppercase tracking-wider mb-1.5">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (mínimo 6 carac.)"
                  className="w-full px-3 py-2 bg-[#1b1c2b] text-geek-light border border-white/5 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-secondary hover:bg-secondary/95 text-background font-extrabold rounded-xl shadow-neon-cyan transition"
              >
                Crear Cuenta
              </button>
            </form>
          )}

          {/* Social Sign In Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121422] px-3.5 text-geek-muted font-bold text-[10px] tracking-wider">O inicia con</span>
            </div>
          </div>

          {/* OAuth Buttons Grid */}
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handleOAuthLogin('Google')}
              className="py-2.5 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5 flex items-center justify-center space-x-2 transition"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              <span>Google</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
