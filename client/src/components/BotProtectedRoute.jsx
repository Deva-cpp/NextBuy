import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import CaptchaVerification from './CaptchaVerification';
import { sendBehavioralData } from '../utils/botProtection';

// This is a higher-order component that wraps protected routes
const BotProtectedRoute = ({ children, requireCaptcha = false }) => {
  const [isVerified, setIsVerified] = useState(!requireCaptcha);
  const [showCaptcha, setShowCaptcha] = useState(requireCaptcha);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Send behavioral data when component mounts
    const sendData = async () => {
      try {
        await sendBehavioralData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending behavioral data:', error);
        setIsLoading(false);
      }
    };
    
    sendData();
    
    // Set up interval to periodically send behavioral data
    const interval = setInterval(() => {
      sendBehavioralData();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle CAPTCHA success
  const handleCaptchaSuccess = () => {
    setIsVerified(true);
    setShowCaptcha(false);
  };
  
  // Handle API responses that require CAPTCHA
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if the error response indicates bot detection
        if (error.response && 
            error.response.status === 403 && 
            error.response.data.requireCaptcha) {
          setShowCaptcha(true);
          setIsVerified(false);
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (showCaptcha) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <CaptchaVerification 
            onSuccess={handleCaptchaSuccess} 
            onFailure={() => setShowCaptcha(true)}
          />
        </div>
      </div>
    );
  }
  
  return isVerified ? children : <Navigate to="/" />;
};

export default BotProtectedRoute; 