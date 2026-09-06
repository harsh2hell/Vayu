import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { getDashboardUrl, getAuthUrl } from './utils/domain';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {PUBLISHABLE_KEY ? (
          <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY}
            signInFallbackRedirectUrl={getDashboardUrl()}
            signUpFallbackRedirectUrl={getDashboardUrl()}
            afterSignOutUrl={getAuthUrl()}
          >
            <App />
          </ClerkProvider>
        ) : (
          <App />
        )}
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
