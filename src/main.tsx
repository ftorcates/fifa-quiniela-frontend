import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { Modal } from './components/Modal';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModalProvider>
      <AuthProvider>
        <Modal />
        <App />
      </AuthProvider>
    </ModalProvider>
  </StrictMode>
);
