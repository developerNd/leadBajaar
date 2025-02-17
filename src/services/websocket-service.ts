// import Echo from 'laravel-echo'
// import Pusher from 'pusher-js'

// declare global {
//   interface Window {
//     Echo: Echo
//     Pusher: any
//   }
// }

// class WebSocketService {
//   private ws: WebSocket | null = null
//   private messageHandlers: ((data: any) => void)[] = []
//   private reconnectAttempts = 0
//   private maxReconnectAttempts = 5

//   initialize() {
//     if (typeof window === 'undefined') return

//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
//     const host = process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname
//     const port = process.env.NEXT_PUBLIC_REVERB_PORT || '8080'

//     this.connect(`${protocol}//${host}:${port}/websocket`)
//   }

//   private connect(url: string) {
//     try {
//       this.ws = new WebSocket(url)

//       this.ws.onopen = () => {
//         console.log('Connected to Reverb')
//         this.reconnectAttempts = 0
//         // Subscribe to the chat channel
//         this.subscribe('chat')
//       }

//       this.ws.onmessage = (event) => {
//         const data = JSON.parse(event.data)
//         if (data.event === 'chat.message') {
//           this.messageHandlers.forEach(handler => handler(data.data))
//         }
//       }

//       this.ws.onclose = () => {
//         console.log('Disconnected from Reverb')
//         this.attemptReconnect(url)
//       }

//       this.ws.onerror = (error) => {
//         console.error('WebSocket error:', error)
//       }
//     } catch (error) {
//       console.error('WebSocket connection error:', error)
//     }
//   }

//   private attemptReconnect(url: string) {
//     if (this.reconnectAttempts < this.maxReconnectAttempts) {
//       this.reconnectAttempts++
//       setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts)
//     }
//   }

//   private subscribe(channel: string) {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify({
//         event: 'subscribe',
//         channel
//       }))
//     }
//   }

//   addMessageHandler(handler: (data: any) => void) {
//     this.messageHandlers.push(handler)
//   }

//   removeMessageHandler(handler: (data: any) => void) {
//     this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
//   }

//   async sendMessage(message: string) {
//     try {
//       const response = await fetch('/api/chat/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message }),
//       })

//       if (!response.ok) {
//         throw new Error('Failed to send message')
//       }

//       return await response.json()
//     } catch (error) {
//       console.error('Error sending message:', error)
//       throw error
//     }
//   }

//   disconnect() {
//     if (this.ws) {
//       this.ws.close()
//       this.ws = null
//     }
//   }
// }

// export const wsService = new WebSocketService() 