import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import { VoiceNoteProvider } from './hooks/chatHooks/useVoiceNote'
import { ChatProvider } from './contexts/ChatContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Provider store={store}>
        <VoiceNoteProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </VoiceNoteProvider>
      </Provider>
    </HashRouter>
  </StrictMode>,
)
