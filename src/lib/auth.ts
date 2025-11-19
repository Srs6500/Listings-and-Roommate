import { signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// University email verification
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateUniversityEmail = (email: string): boolean => {
  const universityDomains = [
    '.edu',
    '.ac.uk',
    '.ac.ca',
    '.ac.au',
    '.university',
    '.college'
  ];
  
  // Allow admin email to bypass university validation
  if (email === 'admin@loyveil.edu') {
    return true;
  }
  
  return universityDomains.some(domain => email.toLowerCase().endsWith(domain));
};

export const sendVerificationCode = async (email: string, code: string): Promise<boolean> => {
  try {
    // Send real email using EmailJS or similar service
    console.log(`Sending verification code ${code} to ${email}`);
    
    // For now, we'll use a simple email service
    // In production, use SendGrid, AWS SES, or similar
    const response = await fetch('/api/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code
      })
    });
    
    if (response.ok) {
      // Store code in localStorage for demo purposes
      localStorage.setItem(`verification_${email}`, code);
      localStorage.setItem(`verification_time_${email}`, Date.now().toString());
      
      // Track resend attempts
      const resendCount = parseInt(localStorage.getItem(`resend_count_${email}`) || '0');
      localStorage.setItem(`resend_count_${email}`, (resendCount + 1).toString());
      
      return true;
    } else {
      // Fallback to console log for demo
      console.log(`DEMO: Verification code ${code} sent to ${email}`);
      localStorage.setItem(`verification_${email}`, code);
      localStorage.setItem(`verification_time_${email}`, Date.now().toString());
      
      const resendCount = parseInt(localStorage.getItem(`resend_count_${email}`) || '0');
      localStorage.setItem(`resend_count_${email}`, (resendCount + 1).toString());
      
      return true;
    }
  } catch (error) {
    console.error('Error sending verification code:', error);
    // Fallback to demo mode
    console.log(`DEMO: Verification code ${code} sent to ${email}`);
    localStorage.setItem(`verification_${email}`, code);
    localStorage.setItem(`verification_time_${email}`, Date.now().toString());
    
    const resendCount = parseInt(localStorage.getItem(`resend_count_${email}`) || '0');
    localStorage.setItem(`resend_count_${email}`, (resendCount + 1).toString());
    
    return true;
  }
};

export const verifyUniversityCode = (email: string, code: string): boolean => {
  try {
    const storedCode = localStorage.getItem(`verification_${email}`);
    const storedTime = localStorage.getItem(`verification_time_${email}`);
    
    if (!storedCode || !storedTime) return false;
    
    // Check if code is expired (2 minutes)
    const timeDiff = Date.now() - parseInt(storedTime);
    if (timeDiff > 2 * 60 * 1000) return false;
    
    return storedCode === code;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

// Enhanced verification for the new email verification flow
export const verifyEmailCode = (email: string, code: string): boolean => {
  try {
    const storedCode = localStorage.getItem(`verification_${email}`);
    const storedTime = localStorage.getItem(`verification_time_${email}`);
    
    if (!storedCode || !storedTime) return false;
    
    // Check if code is expired (2 minutes)
    const timeDiff = Date.now() - parseInt(storedTime);
    if (timeDiff > 2 * 60 * 1000) return false;
    
    // Only accept the correct stored code
    if (code === storedCode) {
      // Clear the code after successful verification (one-time use)
      localStorage.removeItem(`verification_${email}`);
      localStorage.removeItem(`verification_time_${email}`);
      localStorage.removeItem(`resend_count_${email}`);
      return true;
    }
    
    return storedCode === code;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

// Check if user is blocked due to too many resend attempts
export const checkBlockStatus = (email: string): { isBlocked: boolean; blockType: string; timeLeft: number } => {
  const resendCount = parseInt(localStorage.getItem(`resend_count_${email}`) || '0');
  const lastBlockTime = localStorage.getItem(`block_time_${email}`);
  const blockType = localStorage.getItem(`block_type_${email}`) || '';
  
  if (resendCount >= 3) {
    if (!lastBlockTime) {
      // First time hitting 3 attempts - 1 hour block
      const blockTime = Date.now();
      localStorage.setItem(`block_time_${email}`, blockTime.toString());
      localStorage.setItem(`block_type_${email}`, '1hour');
      return { isBlocked: true, blockType: '1hour', timeLeft: 60 * 60 * 1000 };
    }
    
    const timeSinceBlock = Date.now() - parseInt(lastBlockTime);
    
    if (blockType === '1hour') {
      if (timeSinceBlock < 60 * 60 * 1000) {
        return { isBlocked: true, blockType: '1hour', timeLeft: 60 * 60 * 1000 - timeSinceBlock };
      } else {
        // Upgrade to 24 hour block
        localStorage.setItem(`block_time_${email}`, Date.now().toString());
        localStorage.setItem(`block_type_${email}`, '24hour');
        return { isBlocked: false, blockType: '', timeLeft: 0 };
      }
    }
    
    if (blockType === '24hour') {
      if (timeSinceBlock < 24 * 60 * 60 * 1000) {
        return { isBlocked: true, blockType: '24hour', timeLeft: 24 * 60 * 60 * 1000 - timeSinceBlock };
      } else {
        // Upgrade to permanent block
        localStorage.setItem(`block_type_${email}`, 'permanent');
        return { isBlocked: true, blockType: 'permanent', timeLeft: 0 };
      }
    }
    
    if (blockType === 'permanent') {
      return { isBlocked: true, blockType: 'permanent', timeLeft: 0 };
    }
  }
  
  return { isBlocked: false, blockType: '', timeLeft: 0 };
};

// Get resend count for an email
export const getResendCount = (email: string): number => {
  return parseInt(localStorage.getItem(`resend_count_${email}`) || '0');
};

// Clear all block data for fresh start (for testing)
export const clearAllBlockData = (email: string): void => {
  localStorage.removeItem(`resend_count_${email}`);
  localStorage.removeItem(`block_time_${email}`);
  localStorage.removeItem(`block_type_${email}`);
  localStorage.removeItem(`verification_${email}`);
  localStorage.removeItem(`verification_time_${email}`);
  console.log(`Cleared all block data for ${email}`);
};

// Clear all block data for all emails (nuclear option)
export const clearAllBlockDataGlobally = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('resend_count_') || 
        key.includes('block_time_') || 
        key.includes('block_type_') ||
        key.includes('verification_') ||
        key.includes('login_attempts_') ||
        key.includes('login_block_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Cleared all block data globally');
};

// Clear only login attempt data
export const clearLoginAttemptData = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('login_attempts_') || 
        key.includes('login_block_') || 
        key.includes('verification_') || 
        key.includes('resend_count_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Cleared all login attempt and verification data');
};

// Login attempt tracking and rate limiting
export const trackLoginAttempt = (email: string, success: boolean): { isBlocked: boolean; attemptsLeft: number; blockTimeLeft?: number } => {
  const attemptKey = `login_attempts_${email}`;
  const blockKey = `login_block_${email}`;
  const maxAttempts = 3;
  const blockDuration = 15 * 60 * 1000; // 15 minutes

  if (success) {
    // Clear attempts on successful login
    localStorage.removeItem(attemptKey);
    localStorage.removeItem(blockKey);
    return { isBlocked: false, attemptsLeft: maxAttempts };
  }

  // Get current attempts
  const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0');
  const newAttempts = currentAttempts + 1;
  
  // Check if already blocked
  const blockTime = localStorage.getItem(blockKey);
  if (blockTime) {
    const timeSinceBlock = Date.now() - parseInt(blockTime);
    if (timeSinceBlock < blockDuration) {
      return { 
        isBlocked: true, 
        attemptsLeft: 0, 
        blockTimeLeft: blockDuration - timeSinceBlock 
      };
    } else {
      // Block expired, reset attempts
      localStorage.removeItem(blockKey);
      localStorage.removeItem(attemptKey);
      // Reset to 0 attempts after block expires
      return { isBlocked: false, attemptsLeft: maxAttempts };
    }
  }

  // Update attempts
  localStorage.setItem(attemptKey, newAttempts.toString());

  if (newAttempts >= maxAttempts) {
    // Block the account for exactly 15 minutes
    localStorage.setItem(blockKey, Date.now().toString());
    return { 
      isBlocked: true, 
      attemptsLeft: 0, 
      blockTimeLeft: blockDuration 
    };
  }

  return { 
    isBlocked: false, 
    attemptsLeft: maxAttempts - newAttempts 
  };
};

export const checkLoginBlockStatus = (email: string): { isBlocked: boolean; attemptsLeft: number; blockTimeLeft?: number } => {
  const attemptKey = `login_attempts_${email}`;
  const blockKey = `login_block_${email}`;
  const maxAttempts = 3;
  const blockDuration = 15 * 60 * 1000; // 15 minutes

  const blockTime = localStorage.getItem(blockKey);
  if (blockTime) {
    const timeSinceBlock = Date.now() - parseInt(blockTime);
    if (timeSinceBlock < blockDuration) {
      return { 
        isBlocked: true, 
        attemptsLeft: 0, 
        blockTimeLeft: blockDuration - timeSinceBlock 
      };
    } else {
      // Block expired, reset
      localStorage.removeItem(blockKey);
      localStorage.removeItem(attemptKey);
    }
  }

  const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0');
  return { 
    isBlocked: false, 
    attemptsLeft: maxAttempts - currentAttempts 
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Check if account is blocked
    const blockStatus = checkLoginBlockStatus(email);
    if (blockStatus.isBlocked) {
      const minutesLeft = Math.ceil((blockStatus.blockTimeLeft || 0) / (1000 * 60));
      throw new Error(`Account temporarily blocked. Try again in ${minutesLeft} minutes.`);
    }

    // Try Firebase authentication first (for real users)
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user document exists in Firestore, create if not
    try {
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log('🔍 Checking user document for:', result.user.uid);
      console.log('📄 Document exists:', userDoc.exists());
      
      if (!userDoc.exists()) {
        // Create user document for existing auth user
        const userData = {
          email: email,
          savedListings: [],
          receipts: [], // Add receipts array for bidirectional linking
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          authProvider: 'email'
        };
        
        console.log('📝 Creating user document with data:', userData);
        await setDoc(userDocRef, userData);
        console.log('✅ User document created for existing auth user:', result.user.uid);
      } else {
        // Update last active timestamp
        console.log('🔄 Updating last active timestamp for user:', result.user.uid);
        await setDoc(userDocRef, { lastActive: serverTimestamp() }, { merge: true });
        console.log('✅ User document updated');
      }
    } catch (firestoreError) {
      console.error('❌ Error handling Firestore user document:', firestoreError);
      console.error('❌ Error details:', firestoreError);
      // Don't block login if Firestore fails
    }
    
    // Track successful login
    trackLoginAttempt(email, true);
    
    return { user: result.user };
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    
    // Track failed login attempt
    const attemptStatus = trackLoginAttempt(email, false);
    
    if (attemptStatus.isBlocked) {
      const minutesLeft = Math.ceil((attemptStatus.blockTimeLeft || 0) / (1000 * 60));
      throw new Error(`Too many failed attempts. Account blocked for ${minutesLeft} minutes.`);
    } else if (attemptStatus.attemptsLeft <= 1) {
      throw new Error(`Invalid credentials. ${attemptStatus.attemptsLeft} attempt remaining before account is blocked.`);
    } else {
      throw new Error(`Invalid credentials. ${attemptStatus.attemptsLeft} attempts remaining.`);
    }
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log('🚀 Starting sign up process for:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase Auth user created:', result.user.uid);
    
    // Create user document in Firestore
    const userData = {
      email: email,
      savedListings: [],
      receipts: [], // Add receipts array for bidirectional linking
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      authProvider: 'email'
    };
    
    console.log('📝 Creating Firestore user document with data:', userData);
    await setDoc(doc(db, 'users', result.user.uid), userData);
    console.log('✅ User document created in Firestore:', result.user.uid);
    
    return { user: result.user };
  } catch (error) {
    console.error('❌ Error signing up with email:', error);
    console.error('❌ Error details:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};


