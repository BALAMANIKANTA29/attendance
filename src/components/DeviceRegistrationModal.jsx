import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { 
  getDeviceId, 
  isDeviceRegistered, 
  registerDevice, 
  getDeviceInfo 
} from '../services/deviceAuthService';

export const DeviceRegistrationModal = ({ onRegistered }) => {
  const [status, setStatus] = useState('pending'); // pending, loading, success, error
  const [message, setMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // Check if already registered
        if (isDeviceRegistered()) {
          setStatus('success');
          setMessage('Device is already registered');
          setTimeout(() => {
            onRegistered();
          }, 1500);
          return;
        }

        // Get device ID
        const id = getDeviceId();
        setDeviceId(id);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to initialize device');
      }
    };

    initializeDevice();
  }, [onRegistered]);

  const handleRegister = async () => {
    setStatus('loading');
    setMessage('Registering device...');

    try {
      const result = await registerDevice('http://localhost:3001');
      setStatus('success');
      setMessage(result.message || 'Device registered successfully!');
      
      setTimeout(() => {
        onRegistered();
      }, 1500);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to register device');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Device Registration
        </h2>

        {status === 'pending' && (
          <div>
            <p className="text-gray-600 text-center mb-4">
              To protect your sensitive student and backlog data, please register this device.
            </p>
            <div className="bg-gray-100 rounded p-3 mb-4 break-all">
              <p className="text-xs text-gray-500">Device ID:</p>
              <p className="text-sm font-mono text-gray-700">{deviceId}</p>
            </div>
            <button
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
            >
              Register This Device
            </button>
          </div>
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
            <p className="text-sm text-gray-500 mt-2">Access granted to this device</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-600 font-semibold mb-3">{message}</p>
            <button
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status !== 'loading' && status !== 'pending' && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Only your registered device can access sensitive data.
          </p>
        )}
      </div>
    </div>
  );
};
