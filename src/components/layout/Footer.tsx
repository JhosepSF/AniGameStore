import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck, Heart, ShieldAlert, Award, Instagram, Twitter, MessageSquare, Facebook } from 'lucide-react'
import Swal from 'sweetalert2'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    Swal.fire({
      title: '¡Subscripción completada!',
      text: 'Te enviaremos las mejores ofertas y lanzamientos anime en primicia.',
      icon: 'success',
      confirmButtonText: '¡Genial!',
      background: '#121422',
      color: '#f1f3f9',
      confirmButtonColor: '#ff007f'
    })
    setEmail('')
  }

  return (
    <footer className="bg-[#05060a] border-t border-white/5 pt-16 pb-8 text-geek-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent neon-text-pink">
              ANIGAMES STORE
            </h3>
            <p className="text-sm text-geek-muted leading-relaxed">
              Tu universo definitivo de anime, gaming y coleccionables premium. Importamos directamente de Japón y garantizamos autenticidad en cada figura.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/5 rounded-lg text-geek-muted hover:text-primary transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg text-geek-muted hover:text-secondary transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg text-geek-muted hover:text-accent transition">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg text-geek-muted hover:text-[#1877f2] transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-geek-light uppercase tracking-widest mb-4">Categorías</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalogo?categoria=figuras" className="text-geek-muted hover:text-secondary transition">Figuras Oficiales</Link></li>
              <li><Link to="/catalogo?categoria=gaming" className="text-geek-muted hover:text-secondary transition">Consolas & Mandos</Link></li>
              <li><Link to="/catalogo?categoria=tecnologia" className="text-geek-muted hover:text-secondary transition">Teclados y Mouses</Link></li>
              <li><Link to="/catalogo?categoria=accesorios" className="text-geek-muted hover:text-secondary transition">Mousepads y Mochilas</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-bold text-geek-light uppercase tracking-widest mb-4">Soporte</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/panelcliente" className="text-geek-muted hover:text-primary transition">Mis Pedidos</Link></li>
              <li><Link to="/catalogo" className="text-geek-muted hover:text-primary transition">Preguntas Frecuentes</Link></li>
              <li><a href="#" className="text-geek-muted hover:text-primary transition">Políticas de Devolución</a></li>
              <li><a href="#" className="text-geek-muted hover:text-primary transition">Términos del Servicio</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-geek-light uppercase tracking-widest mb-2">Comunidad Otaku</h4>
            <p className="text-xs text-geek-muted leading-normal">
              Suscríbete al newsletter para recibir alertas de pre-ordenes y códigos de cupones exclusivos.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                className="w-full px-3 py-2 bg-[#121422] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary text-geek-light"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg text-sm font-semibold shadow-neon-pink transition flex items-center"
              >
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Security / Partners badges */}
        <div className="border-t border-white/5 py-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          
          {/* Shipments partners */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-geek-muted font-medium">Envíos Asegurados por:</span>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Olva Courier</span>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-red-500/10 text-red-500 rounded border border-red-500/20">Shalom</span>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">Marvisur</span>
          </div>

          {/* Payments partners */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-geek-muted font-medium mr-2">Pagos 100% Seguros:</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#6772e5]/10 text-[#6772e5] border border-[#6772e5]/20 rounded">Stripe</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#0070ba]/10 text-[#0070ba] border border-[#0070ba]/20 rounded">PayPal</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#2d3277]/10 text-[#00ffc2] border border-[#00ffc2]/20 rounded">Mercado Pago</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 rounded">Yape / Plin</span>
          </div>

        </div>

        {/* Brand signature */}
        <div className="border-t border-white/5 pt-8 text-center text-xs text-geek-muted flex flex-col sm:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AniGames Store S.A.C. Todos los derechos reservados.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Hecho con <Heart className="w-3 h-3 mx-1 text-primary animate-pulse" /> para la comunidad Geek.
          </p>
        </div>

      </div>
    </footer>
  )
}
