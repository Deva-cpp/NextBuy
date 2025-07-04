import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { showError, showSuccess } from "../utils/notification";
import HoneypotForm from "./HoneypotForm";
import ReCAPTCHA from "react-google-recaptcha";
import { sendBehavioralData } from "../utils/botProtection";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    emailAddress: "",
    passWord: "",
    userName: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value.trimStart() }));
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check if the event was triggered by honeypot
    if (e.honeypotTriggered) {
      // Silently fail - pretend success but don't actually log in
      showSuccess("Login Successful");
      setTimeout(() => {
        showError("Session expired. Please login again.");
      }, 2000);
      return;
    }
    
    try {
      if (
        form.emailAddress === "" ||
        form.passWord === "" ||
        form.userName === ""
      ) {
        showError("Please fill all the required details");
        return;
      }
      
      // Send behavioral data before login attempt
      await sendBehavioralData();
      
      // If we've had multiple failed attempts, show CAPTCHA
      if (showCaptcha && !captchaToken) {
        showError("Please complete the CAPTCHA");
        return;
      }
      
      const loginData = { ...form };
      if (captchaToken) {
        loginData.captchaToken = captchaToken;
      }
      
      try {
        await axios.post(
          `http://localhost:5000/api/auth/login`,
          loginData
        );
        await login(form);
        showSuccess("Login Successful");
        navigate("/");
      } catch (error) {
        // Check if the error is due to bot detection
        if (error.response && error.response.data.requireCaptcha) {
          setShowCaptcha(true);
          showError("Please complete the security verification");
          return;
        }
        
        // Increment failed attempts
        setShowCaptcha(true);
        showError("User not found. Please Register.");
        console.error(error);
      }
    } catch (error) {
      showError("User not found. Please Register.");
      navigate("/signup");
      console.error(error);
    }
  };

  return (
    <HoneypotForm
      className="relative space-y-3 rounded-md bg-white p-6 shadow-xl lg:p-10 border border-sky-100 mt-10 mx-auto max-w-100"
      onSubmit={handleLogin}
    >
      <h1 className="text-xl font-semibold lg:text-2xl text-sky-950">Login</h1>
      <p className="text-sky-800">Sign in to access your account</p>
      <div className="">
        <label className="text-sky-950 font-medium"> Username </label>
        <input
          type="text"
          placeholder="username"
          name="userName"
          pattern="^[a-zA-Z0-9_]{4,}$"
          title="Username must be at least 4 characters, no spaces"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div className="">
        <label className="text-sky-950 font-medium"> Email Address </label>
        <input
          type="email"
          placeholder="username@example.com"
          name="emailAddress"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Password </label>
        <input
          type="password"
          placeholder="**********"
          name="passWord"
          pattern=".{6,}"
          title="Password must be at least 6 characters"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      
      {showCaptcha && (
        <div className="flex justify-center my-4">
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key
            onChange={handleCaptchaChange}
          />
        </div>
      )}
      
      <div>
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-sky-600 p-2 text-center font-semibold text-white hover:bg-sky-700 cursor-pointer"
        >
          Login
        </button>
      </div>
    </HoneypotForm>
  );
};

export default Login;
