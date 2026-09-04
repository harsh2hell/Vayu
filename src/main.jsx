import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {PUBLISHABLE_KEY ? (
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY}
          afterSignOutUrl="/"
        >
          <App />
        </ClerkProvider>
      ) : (
        <App />
      )}
    </BrowserRouter>
  </StrictMode>,
);
