import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  sender_name: string
  message: string
  created_at: string
}

export interface ChatRoom {
  id: string
  user_id: string
  status: 'open' | 'active' | 'closed'
  created_at: string
}

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm-1', room_id: 'r-1', sender_id: 'agent', sender_name: 'Sophia (Soporte)', message: '¡Hola! Bienvenido al canal de soporte de AniGames Store. ¿En qué podemos ayudarte hoy con tus pedidos o stock?', created_at: new Date(Date.now() - 600000).toISOString() }
]

const SIMULATED_ANSWERS = [
  "¡Excelente pregunta! Sí, tenemos stock disponible del Luffy Gear 5 en nuestra tienda de Lima. Hacemos envíos inmediatos.",
  "Hola, respecto a tu envío por Shalom, los pedidos demoran entre 24 a 48 horas en llegar a provincia una vez confirmada la salida.",
  "¡Por supuesto! Recuerda que con el cupón NEONGEEK obtienes un 15% de descuento en compras mayores a S/ 50.",
  "Entendido. Por favor facilítanos tu número de pedido para poder revisar el estado de despacho con Olva Courier inmediatamente.",
  "Claro, realizamos reembolsos o cambios de productos si reportas algún daño de fábrica dentro de los primeros 7 días de recibido."
]

let chatListeners: ((msg: ChatMessage) => void)[] = []

export const chatService = {
  async getChatRoom(userId: string): Promise<ChatRoom> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_rooms')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .single()

      if (!error && data) return data

      // Otherwise create room
      const { data: newRoom, error: cErr } = await supabase.from('chat_rooms')
        .insert({ user_id: userId, status: 'open' })
        .select()
        .single()

      if (!cErr && newRoom) return newRoom
    }

    return {
      id: 'r-1',
      user_id: userId,
      status: 'open',
      created_at: new Date().toISOString()
    }
  },

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_messages')
        .select('*, profiles(first_name)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        return data.map((m: any) => ({
          id: m.id,
          room_id: roomId,
          sender_id: m.sender_id,
          sender_name: m.profiles?.first_name || 'Tú',
          message: m.message,
          created_at: m.created_at
        }))
      }
    }
    return MOCK_CHAT_MESSAGES
  },

  async sendMessage(roomId: string, senderId: string, senderName: string, message: string): Promise<ChatMessage> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: senderId,
        message: message
      }).select().single()

      if (!error && data) {
        return {
          id: data.id,
          room_id: roomId,
          sender_id: senderId,
          sender_name: senderName,
          message: message,
          created_at: data.created_at
        }
      }
    }

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderName,
      message,
      created_at: new Date().toISOString()
    }
    MOCK_CHAT_MESSAGES.push(newMsg)

    // Notify listeners
    chatListeners.forEach(cb => cb(newMsg))

    // SIMULATED AUTO RESPONSE
    if (senderId !== 'agent') {
      setTimeout(() => {
        const randomAnswer = SIMULATED_ANSWERS[Math.floor(Math.random() * SIMULATED_ANSWERS.length)]
        const agentMsg: ChatMessage = {
          id: Math.random().toString(),
          room_id: roomId,
          sender_id: 'agent',
          sender_name: 'Sophia (Soporte)',
          message: randomAnswer,
          created_at: new Date().toISOString()
        }
        MOCK_CHAT_MESSAGES.push(agentMsg)
        chatListeners.forEach(cb => cb(agentMsg))
      }, 1500)
    }

    return newMsg
  },

  subscribeToMessages(callback: (msg: ChatMessage) => void) {
    chatListeners.push(callback)
    
    // In real Supabase, we would setup a channel:
    // const channel = supabase.channel('chat_messages').on('postgres_changes', ...).subscribe()
    
    return () => {
      chatListeners = chatListeners.filter(cb => cb !== callback)
    }
  }
}
