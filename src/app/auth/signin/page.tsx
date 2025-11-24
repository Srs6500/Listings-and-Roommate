'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signInWithEmail, signUpWithEmail, validateUniversityEmail, generateVerificationCode, sendVerificationCode, verifyUniversityCode, clearAllBlockDataGlobally, clearLoginAttemptData, checkLoginBlockStatus, trackLoginAttempt, signOutUser } from '@/lib/auth';
import UniversityEmailVerification from '@/components/UniversityEmailVerification';
import EmailVerification from '@/components/EmailVerification';
import ForgotPassword from '@/components/ForgotPassword';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function SignInPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUniversityVerification, setShowUniversityVerification] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [loginAttemptStatus, setLoginAttemptStatus] = useState<{ isBlocked: boolean; attemptsLeft: number; blockTimeLeft?: number } | null>(null);
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false);
  const [debugCode, setDebugCode] = useState<string>('');
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (user && !isValidatingCredentials && !showEmailVerification) {
      // Check if user is admin and redirect accordingly
      if (user.email === 'admin@loyveil.edu') {
        router.push('/listings?tab=admin');
      } else {
        router.push('/');
      }
    }
    
    // Show reset button in development
    if (process.env.NODE_ENV === 'development') {
      setShowResetButton(true);
    }
  }, [user, router, isValidatingCredentials, showEmailVerification]);


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate university email first
    if (!validateUniversityEmail(email)) {
      setError('Please use a valid university email address (.edu, .ac.uk, etc.)');
      return;
    }
    
    // Check if account is already blocked (but don't count this as an attempt)
    if (email) {
      const status = checkLoginBlockStatus(email);
      setLoginAttemptStatus(status);
      
      if (status.isBlocked) {
        const minutesLeft = Math.ceil((status.blockTimeLeft || 0) / (1000 * 60));
        setError(`Account temporarily blocked. Try again in ${minutesLeft} minutes.`);
        return;
      }
    }
    
    try {
      // For sign up, we need to verify email first
      if (isSignUp) {
        // First, generate and send verification code
        console.log('Sending verification code to:', email);
        const verificationCode = generateVerificationCode();
        setDebugCode(verificationCode); // Store code for debugging
        const codeSent = await sendVerificationCode(email, verificationCode);
        
        console.log('Code sent successfully:', codeSent);
        
        if (codeSent) {
          // Store credentials for after verification
          setPendingUser({ email, password, isSignUp });
          setShowEmailVerification(true);
          setSuccess('Verification code sent to your email!');
          console.log('Showing email verification screen');
        } else {
          setError('Failed to send verification code. Please try again.');
        }
      } else {
        // Sign-in flow: authenticate first to validate credentials and update attempt tracking
        console.log('Attempting to sign in with:', email);
        setIsValidatingCredentials(true);
        try {
          const result = await signInWithEmail(email, password);
          // Immediately sign out; we only wanted to validate credentials.
          await signOutUser();
        // After successful credential check, send verification code
        console.log('Credentials valid. Sending verification code to:', email);
        const verificationCode = generateVerificationCode();
        setDebugCode(verificationCode); // Store code for debugging
        const codeSent = await sendVerificationCode(email, verificationCode);

          if (codeSent) {
            setPendingUser({ email, password, isSignUp: false });
            setShowEmailVerification(true);
            setSuccess('Verification code sent to your email!');
            console.log('Showing email verification screen');
          } else {
            setError('Failed to send verification code. Please try again.');
          }
        } finally {
          setIsValidatingCredentials(false);
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle specific Firebase errors with custom messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.message.includes('Account temporarily blocked')) {
        setError(err.message);
      } else if (err.message.includes('attempts remaining')) {
        setError(err.message);
      } else {
        setError(err.message);
      }
      
      // Update login attempt status after error
      if (email) {
        const status = checkLoginBlockStatus(email);
        setLoginAttemptStatus(status);
      }
    }
  };

  const handleUniversityVerificationComplete = (universityEmail: string) => {
    // User successfully verified their university email
    console.log('University email verified:', universityEmail);
    setShowUniversityVerification(false);
    setPendingUser(null);
    // User is now logged in and can access the app
  };

  const handleEmailVerificationSuccess = async () => {
    // User successfully verified their email, now authenticate them
    console.log('Email verified successfully, authenticating user');
    
    try {
      if (pendingUser) {
        // Show loading overlay immediately
        setLoadingMessage(pendingUser.isSignUp ? 'Creating your account...' : 'Signing you in...');
        setShowLoadingOverlay(true);
        
        // Hide email verification screen immediately
        setShowEmailVerification(false);
        
        let result;
        if (pendingUser.isSignUp) {
          // Create new account
          result = await signUpWithEmail(pendingUser.email, pendingUser.password);
          console.log('User account created:', result.user);
          setSuccess('Account created successfully! You are now signed in.');
        } else {
          // Sign in existing user - this is where we track attempts
          result = await signInWithEmail(pendingUser.email, pendingUser.password);
          console.log('User signed in:', result.user);
          setSuccess('Sign in successful!');
        }
        
        // Keep loading overlay for smooth transition
        setTimeout(() => {
          setShowLoadingOverlay(false);
          setPendingUser(null);
        }, 4500);
        
        // User is now logged in and will be redirected to main app
      } else {
        setError('Invalid verification state. Please try again.');
        setShowEmailVerification(false);
        setPendingUser(null);
      }
    } catch (err: any) {
      console.error('Authentication failed after verification:', err);
      
      // Track failed login attempt ONLY when authentication fails
      if (pendingUser?.email && !pendingUser.isSignUp) {
        const attemptStatus = trackLoginAttempt(pendingUser.email, false);
        setLoginAttemptStatus(attemptStatus);
        
        if (attemptStatus.isBlocked) {
          const minutesLeft = Math.ceil((attemptStatus.blockTimeLeft || 0) / (1000 * 60));
          setError(`Too many failed attempts. Account blocked for ${minutesLeft} minutes.`);
          setShowEmailVerification(false);
          setPendingUser(null);
        } else if (attemptStatus.attemptsLeft <= 1) {
          setError(`Invalid credentials. ${attemptStatus.attemptsLeft} attempt remaining before account is blocked.`);
          setShowEmailVerification(false);
          setPendingUser(null);
        } else {
          setError(`Invalid credentials. ${attemptStatus.attemptsLeft} attempts remaining.`);
          setShowEmailVerification(false);
          setPendingUser(null);
        }
      } else {
        // Handle other authentication errors
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters long.');
        } else if (err.code === 'auth/user-not-found') {
          setError('No account found with this email. Please sign up first.');
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Authentication failed. Please try again.');
        }
        
        setShowEmailVerification(false);
        setPendingUser(null);
      }
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser?.email) return;
    
    try {
      const verificationCode = generateVerificationCode();
      setDebugCode(verificationCode); // Update debug code
      const codeSent = await sendVerificationCode(pendingUser.email, verificationCode);
      
      if (!codeSent) {
        throw new Error('Failed to resend code');
      }
    } catch (err) {
      throw err;
    }
  };

  const handleResetBlocks = () => {
    clearAllBlockDataGlobally();
    setSuccess('All block data cleared! You can test fresh now.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClearLoginAttempts = () => {
    clearLoginAttemptData();
    setLoginAttemptStatus(null);
    setSuccess('Login attempts cleared! You can test fresh now.');
    setTimeout(() => setSuccess(''), 3000);
  };


  const handleToggleSignUp = () => {
    setIsReloading(true);
    setError('');
    
    // Smooth page reload effect
    setTimeout(() => {
      setEmail('');
      setPassword('');
      setIsSignUp(!isSignUp);
      setIsReloading(false);
    }, 600);
  };


  // Show email verification as full page replacement
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={pendingUser?.email || email}
        onVerificationSuccess={handleEmailVerificationSuccess}
        onResendCode={handleResendCode}
        onBack={() => {
          setShowEmailVerification(false);
          setSuccess('');
          setError('');
        }}
        debugCode={debugCode}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Reload overlay */}
      {isReloading && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.9)' }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }}></div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Switching mode...</p>
          </div>
        </div>
      )}
      
      <div className={`max-w-md w-full space-y-8 transition-all duration-500 ${
        isReloading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
      }`}>
        <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-70 scale-98' : 'opacity-100 scale-100'}`}>
          <div className="text-center">
            <div 
              className={`rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${isTransitioning ? 'animate-pulse' : ''}`}
              style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: 'var(--accent-primary)' 
              }}
            >
              <svg className="w-8 h-8" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 
              className={`text-3xl font-extrabold transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{ color: 'var(--text-primary)' }}
            >
              {isSignUp ? 'Join PropertyFinder' : 'Welcome Back'}
            </h2>
            <p 
              className={`mt-2 text-sm transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{ color: 'var(--text-secondary)' }}
            >
              {isSignUp ? 'Create your student account to get started' : 'Sign in to your student account'}
            </p>
            <div 
              className={`mt-3 px-4 py-2 rounded-lg border transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{ 
                backgroundColor: 'var(--accent-light)', 
                borderColor: 'var(--border-default)'
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                🎓 University Students Only - Use your .edu email address
              </p>
            </div>
            
            {/* Login Attempt Status */}
            {loginAttemptStatus && email && (
              <div 
                className={`mt-3 px-4 py-2 rounded-lg border transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
                style={{
                  backgroundColor: loginAttemptStatus.isBlocked 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : loginAttemptStatus.attemptsLeft <= 1 
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(34, 197, 94, 0.1)',
                  borderColor: loginAttemptStatus.isBlocked 
                    ? 'var(--error)' 
                    : loginAttemptStatus.attemptsLeft <= 1 
                      ? 'var(--warning)'
                      : 'var(--success)'
                }}
              >
                <p 
                  className="text-sm font-medium"
                  style={{
                    color: loginAttemptStatus.isBlocked 
                      ? 'var(--error)' 
                      : loginAttemptStatus.attemptsLeft <= 1 
                        ? 'var(--warning)'
                        : 'var(--success)'
                  }}
                >
                  {loginAttemptStatus.isBlocked ? (
                    <>🔒 Account blocked. Try again in {Math.ceil((loginAttemptStatus.blockTimeLeft || 0) / (1000 * 60))} minutes.</>
                  ) : loginAttemptStatus.attemptsLeft <= 1 ? (
                    <>⚠️ {loginAttemptStatus.attemptsLeft} attempt remaining before account is blocked.</>
                  ) : (
                    <>✅ {loginAttemptStatus.attemptsLeft} attempts remaining.</>
                  )}
                </p>
              </div>
            )}
            
            {/* Reset Buttons for Development */}
            {showResetButton && (
              <div className="mt-2 space-x-4">
                <button
                  onClick={handleResetBlocks}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  🔄 Clear All Block Data
                </button>
                <button
                  onClick={handleClearLoginAttempts}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  🔓 Clear Login Attempts
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div 
          className="backdrop-blur-sm rounded-2xl shadow-2xl border p-8"
          style={{ 
            backgroundColor: 'var(--surface-primary)', 
            borderColor: 'var(--border-default)'
          }}
        >
          <form className={`space-y-6 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`} onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                University Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter your .edu email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div 
              className="border rounded-xl p-4 mb-4"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                borderColor: 'var(--error)' 
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--error)' }}>
                    {error.includes('already registered') ? 'Account Exists' : 
                     error.includes('No account found') ? 'Account Not Found' :
                     error.includes('Incorrect password') ? 'Invalid Password' :
                     error.includes('valid email') ? 'Invalid Email' :
                     error.includes('6 characters') ? 'Weak Password' : 'Error'}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {error}
                  </p>
                  {error.includes('already registered') && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        Switch to Sign In →
                      </button>
                    </div>
                  )}
                  {error.includes('No account found') && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        Switch to Sign Up →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {success && (
            <div 
              className="border rounded-xl p-4 mb-4"
              style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderColor: 'var(--success)' 
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                    Success!
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--success)' }}>
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'var(--text-primary)',
                focusRingColor: 'var(--accent-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleToggleSignUp}
              disabled={isReloading}
              className="text-sm font-medium transition-colors duration-200 disabled:opacity-50 hover:underline"
              style={{ color: 'var(--accent-primary)' }}
              onMouseEnter={(e) => {
                if (!isReloading) e.currentTarget.style.color = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isReloading) e.currentTarget.style.color = 'var(--accent-primary)';
              }}
            >
              {isReloading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: 'var(--accent-primary)' }}></div>
                  Switching mode...
                </span>
              ) : (
                isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"
              )}
            </button>
          </div>
          </form>
        </div>

      </div>



      {/* University Email Verification Modal */}
      <UniversityEmailVerification
        isOpen={showUniversityVerification}
        onClose={() => setShowUniversityVerification(false)}
        onVerificationComplete={handleUniversityVerificationComplete}
        userEmail={pendingUser?.email}
      />

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.8)' }}
        >
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            className="mx-4"
          />
        </div>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showLoadingOverlay} 
        message={loadingMessage}
        type="signin"
      />
    </div>
  );
}
