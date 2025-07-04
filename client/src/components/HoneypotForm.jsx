import { useEffect, useRef } from 'react';
import { addHoneypotToForm } from '../utils/botProtection';

// This component adds honeypot fields to any form
const HoneypotForm = ({ children, onSubmit, className, ...props }) => {
  const formRef = useRef(null);
  
  useEffect(() => {
    if (formRef.current) {
      addHoneypotToForm(formRef.current);
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if honeypot fields are filled
    const honeypotField = formRef.current.querySelector('#website-url');
    if (honeypotField && honeypotField.value) {
      // This is likely a bot - silently fail
      console.log('Honeypot triggered, form submission blocked');
      
      // Pretend the form was submitted successfully
      if (onSubmit) {
        // Call onSubmit with a fake event that looks successful
        onSubmit({
          ...e,
          success: true,
          honeypotTriggered: true
        });
      }
      return;
    }
    
    // If we get here, it's probably a real user
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={className}
      {...props}
    >
      {children}
    </form>
  );
};

export default HoneypotForm; 