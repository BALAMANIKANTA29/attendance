import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { 
  verifyPassword, 
  initializeAdminPassword, 
  hasActiveSession 
} from '../services/passwordAuthService';

export const AdminPasswordModal = ({ onAuthenticated }) => {
  const [status, setStatus] = useState('checking'); // checking, input, loading, success, error
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (hasActiveSession()) {
      setStatus('success');
      setMessage('Already authenticated');
      setTimeout(() => {
        onAuthenticated();
      }, 500);
    } else {
      setStatus('input');
    }
  }, [onAuthenticated]);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setMessage('Please enter the admin password');
      return;
    }

    setStatus('loading');
    setMessage(isInitialSetup ? 'Initializing admin password...' : 'Verifying password...');

    try {
      let result;
      
      if (isInitialSetup) {
        result = await initializeAdminPassword(password);
      } else {
        result = await verifyPassword(password);
      }
      
      setStatus('success');
      setMessage(result.success ? 'Authentication successful!' : 'Access granted');
      
      setTimeout(() => {
        onAuthenticated();
      }, 1500);
    } catch (error) {
      const errorMsg = error.message;
      
      // Check if this is the "already initialized" error
      if (errorMsg.includes('already initialized')) {
        setIsInitialSetup(false);
        setStatus('input');
        setMessage('Please enter the admin password to continue');
        setPassword('');
      } else if (errorMsg.includes('not configured')) {
        setIsInitialSetup(true);
        setStatus('input');
        setMessage('Set up admin password (first time)');
        setPassword('');
      } else {
        setStatus('error');
        setMessage(errorMsg || 'Authentication failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Admin Access Required
        </h2>

        {status === 'checking' && (
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Checking authentication status...</p>
          </div>
        )}

        {status === 'input' && (
          <form onSubmit={handleVerifyPassword}>
            <p className="text-gray-600 text-center mb-4 text-sm">
              {isInitialSetup 
                ? 'Set up your admin password to protect this system.'
                : 'Enter the admin password to access student and backlog data.'}
            </p>
            
            {message && !isInitialSetup && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isInitialSetup ? 'Set Admin Password' : 'Admin Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isInitialSetup ? 'Create a strong password' : 'Enter password'}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {isInitialSetup && (
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 4 characters. Use a strong password.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
            >
              {isInitialSetup ? 'Initialize Password' : 'Verify Password'}
            </button>
          </form>
        )}

        {status === 'loading' && (
          <div className="text-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">You have access to all features</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-600 font-semibold mb-3">{message}</p>
            <button
              onClick={() => {
                setStatus('input');
                setPassword('');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'input' && isInitialSetup && message && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Only users with the correct admin password can access this system.
        </p>
      </div>
    </div>
  );
};
