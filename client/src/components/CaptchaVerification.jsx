import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { getDeviceFingerprint } from '../utils/botProtection';
import axios from 'axios';

const CaptchaVerification = ({ onSuccess, onFailure }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const handleCaptchaChange = async (token) => {
    if (!token) {
      setError('CAPTCHA verification failed. Please try again.');
      if (onFailure) onFailure();
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      // Get device fingerprint
      const deviceFingerprint = await getDeviceFingerprint();
      
      // Send verification to server
      const response = await axios.post('/api/bot-protection/captcha-verification', {
        captchaToken: token,
        deviceFingerprint
      });
      
      if (response.data.success) {
        if (onSuccess) onSuccess();
      } else {
        setError('Verification failed. Please try again.');
        if (onFailure) onFailure();
      }
    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      setError('An error occurred during verification. Please try again.');
      if (onFailure) onFailure();
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Security Verification</h2>
      <p className="text-gray-600 mb-4">
        Please complete the CAPTCHA below to verify you're human.
      </p>
      
      <div className="my-4">
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key
          onChange={handleCaptchaChange}
        />
      </div>
      
      {isVerifying && (
        <div className="flex items-center justify-center my-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-blue-500">Verifying...</span>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
      
      <div className="text-xs text-gray-400 mt-4">
        This site is protected by reCAPTCHA and the Google
        <a href="https://policies.google.com/privacy" className="text-blue-400 hover:underline"> Privacy Policy</a> and
        <a href="https://policies.google.com/terms" className="text-blue-400 hover:underline"> Terms of Service</a> apply.
      </div>
    </div>
  );
};

export default CaptchaVerification; 