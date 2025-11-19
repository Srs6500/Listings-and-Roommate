'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmailCode, checkBlockStatus, getResendCount } from '@/lib/auth';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onResendCode: () => void;
  onBack: () => void;
  debugCode?: string;
}

export default function EmailVerification({ 
  email, 
  onVerificationSuccess, 
  onResendCode, 
  onBack,
  debugCode
}: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeExpiry, setCodeExpiry] = useState(30); // 30 seconds for all attempts
  const [resendCount, setResendCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [resendAvailable, setResendAvailable] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Auto-focus first input on mount and check block status
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Check if user is blocked
    const blockStatus = checkBlockStatus(email);
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      if (blockStatus.blockType === '1hour') {
        const minutes = Math.ceil(blockStatus.timeLeft / (60 * 1000));
        setBlockMessage(`Too many attempts. Try again in ${minutes} minutes.`);
      } else if (blockStatus.blockType === '24hour') {
        const hours = Math.ceil(blockStatus.timeLeft / (60 * 60 * 1000));
        setBlockMessage(`Account temporarily blocked. Try again in ${hours} hours.`);
      } else if (blockStatus.blockType === 'permanent') {
        setBlockMessage('Account permanently blocked. Contact support.');
      }
    }
    
    // Get current resend count
    setResendCount(getResendCount(email));
  }, [email]);

  // Resend cooldown timer (simplified)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Code expiry countdown timer
  useEffect(() => {
    if (codeExpiry > 0) {
      const timer = setTimeout(() => {
        setCodeExpiry(codeExpiry - 1);
        
        // Enable resend immediately when countdown ends (except for 3rd attempt)
        if (codeExpiry === 1) {
          if (resendCount < 3) {
            setResendAvailable(true);
            setResendCooldown(0); // No additional wait time
          } else {
            // 3rd attempt - show block message when countdown hits 0
            setIsBlocked(true);
            setBlockMessage('Maximum attempts reached. Account blocked for 1 hour.');
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeExpiry, resendCount]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.replace(/\D/g, '').slice(0, 6);
        if (pastedCode.length === 6) {
          const newCode = pastedCode.split('');
          setCode(newCode);
          inputRefs.current[5]?.focus();
          handleVerifyCode(pastedCode);
        }
      });
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
        // Verify the code - check both localStorage and current debug code
        const isValid = verifyEmailCode(email, verificationCode) || 
                       (debugCode && verificationCode === debugCode);
      
      if (isValid) {
        setIsVerifying(true);
        setSuccess('Verification successful! Redirecting...');
        // Add smooth transition delay
        setTimeout(() => {
          onVerificationSuccess();
        }, 500);
      } else {
        setError('Invalid verification code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isBlocked || !resendAvailable) return;
    
    // Check if user has exceeded resend limit
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please try again later.');
      return;
    }
    
    setIsLoading(true);
    try {
      await onResendCode();
      
      // Invalidate old code immediately
      localStorage.removeItem(`verification_${email}`);
      localStorage.removeItem(`verification_time_${email}`);
      
      // Simple timing: 30 seconds for new code
      setCodeExpiry(30); // 30 seconds for new code
      setResendAvailable(false); // Disable until countdown ends
      setResendCooldown(0); // No additional wait time
      
      setResendCount(resendCount + 1);
      setError('');
      
      // Check if this was the 3rd attempt
      if (resendCount + 1 >= 3) {
        // The block message will be shown by the countdown timer when it reaches 0
        // No need for setTimeout - let the countdown handle it
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-all duration-200 hover:scale-105"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm hover:shadow-md transition-shadow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium">Back to Sign In</span>
        </button>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              We've sent a 6-digit verification code to
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="font-semibold text-blue-900 text-lg">
                {email}
              </p>
            </div>
            {debugCode && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm font-semibold">🔧 Debug Mode (Email not working yet)</p>
                <p className="text-lg font-mono font-bold">Code: {debugCode}</p>
              </div>
            )}
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-6 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 hover:border-blue-400 hover:scale-105 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Type or paste your 6-digit code
            </p>
            
            {/* Code Expiry Timer - Always show */}
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                codeExpiry > 30 
                  ? 'bg-green-100 text-green-800' 
                  : codeExpiry > 10 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {codeExpiry > 0 ? (
                  `Code expires in ${Math.floor(codeExpiry / 60)}:${(codeExpiry % 60).toString().padStart(2, '0')}`
                ) : (
                  resendCount >= 3 
                    ? 'Maximum attempts reached. Account blocked for 1 hour.'
                    : 'Code expired - please request a new one'
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(isLoading || isVerifying) && (
            <div className="mb-6 flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 font-medium">
                  {isVerifying ? 'Verification successful! Redirecting...' : 'Verifying code...'}
                </span>
              </div>
            </div>
          )}


          {/* Resend Code - Show if not blocked */}
          {!isBlocked && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isLoading || !resendAvailable || resendCount >= 3}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isLoading || !resendAvailable || resendCount >= 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 hover:scale-105'
                }`}
              >
                {!resendAvailable
                  ? 'Resend not available yet'
                  : resendCount >= 3
                    ? 'Final attempt - no more resends'
                    : `Resend verification code (${3 - resendCount} attempts left)`
                }
              </button>
            </div>
          )}

          {/* Demo Note */}
        </div>
      </div>
    </div>
  );
}
