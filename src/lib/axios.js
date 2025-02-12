import axios from 'axios'

const instance = axios.create({
    // baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    baseURL: 'http://localhost:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
})

// Add request interceptor to handle CSRF token
instance.interceptors.request.use(async function (config) {
    // Get CSRF token from cookie
    let token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

    // If no token found, fetch it
    if (!token) {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie')
        token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1]
    }

    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
    }

    return config
})

// Set the Bearer auth token.
const setBearerToken = token => {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export { instance as axios, setBearerToken }