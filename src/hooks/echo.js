import { useEffect, useState } from 'react'
import  api  from '@/lib/api'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// window.Pusher = Pusher

const useEcho = () => {
    const [echoInstance, setEchoInstance] = useState(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.Pusher = Pusher;
        }
        const echo = new Echo({
            broadcaster: 'reverb',
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            authorizer: (channel) => {

                return {
                    authorize: async (socketId, callback) => {
                        try {
                            const response = await api.post('/broadcasting/auth', {
                                socket_id: socketId,
                                channel_name: channel.name
                            })
                            callback(false, response.data)
                        } catch (error) {
                            console.error('Broadcasting auth error:', error)
                            callback(true, error)
                        }
                    }
                }
            },
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
            wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 6001,
            wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 6001,
            forceTLS: false,
            encrypted: true,
            disableStats: true,
            enabledTransports: ['ws', 'wss']
        })

        setEchoInstance(echo)

        return () => {
            if (echo) {
                echo.disconnect()
            }
        }
    }, [])

    return echoInstance
}

export default useEcho