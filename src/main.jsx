import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <SignedIn>
        {/* Only shows the App if logged in */}
        <App />
      </SignedIn>
      <SignedOut>
        {/* Shows the Clerk Login screen if not logged in */}
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#121212]">
          <SignIn />
        </div>
      </SignedOut>
    </ClerkProvider>
  </React.StrictMode>,
)