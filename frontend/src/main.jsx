import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0C1526',
              color: '#E8EDF5',
              border: '1px solid rgba(0,212,255,0.2)',
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#00E5A0', secondary: '#03070F' } },
            error:   { iconTheme: { primary: '#FF4D6D', secondary: '#03070F' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
