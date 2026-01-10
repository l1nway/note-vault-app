import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import './i18n'

import App from './App.jsx'

const queryClient = new QueryClient()

if (
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state == 'installed' && navigator.serviceWorker.controller) {
              window.location.reload()
            }
          })
        })
      })
      .catch(error => console.error('SW registration failed:', error))
  })
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider
      client={queryClient}
    >
      <App/>
    </QueryClientProvider>
  </BrowserRouter>
)