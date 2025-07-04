import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showError, showSuccess } from "../utils/notification";
import HoneypotForm from "./HoneypotForm";
import ReCAPTCHA from "react-google-recaptcha";
import { sendBehavioralData } from "../utils/botProtection";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    emailAddress: "",
    phoneNumber: "",
    passWord: "",
  });
  // Photo
  const [file, setFile] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [requireCaptcha, setRequireCaptcha] = useState(true); // Always require CAPTCHA for signup
  
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Check if the event was triggered by honeypot
    if (e.honeypotTriggered) {
      // Silently fail - pretend success but don't actually sign up
      showSuccess("Signup Successful! Now you can login");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    
    // Send behavioral data before signup attempt
    await sendBehavioralData();
    
    // Require CAPTCHA for signup
    if (requireCaptcha && !captchaToken) {
      showError("Please complete the security verification");
      return;
    }
    
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (file) {
      formData.append("profilePhoto", file);
    }
    if (captchaToken) {
      formData.append("captchaToken", captchaToken);
    }
    
    try {
      if (
        form.fullName === "" ||
        form.userName === "" ||
        form.emailAddress === "" ||
        form.phoneNumber === "" ||
        form.passWord === "" ||
        !file
      ) {
        showError("Please fill all required details including profile photo");
        return;
      } else {
        await axios.post(
          `http://localhost:5000/api/auth/signup`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showSuccess("Signup Successful! Now you can login");
        navigate("/login");
      }
    } catch (error) {
      // Check if the error is due to bot detection
      if (error.response && error.response.data.requireCaptcha) {
        setRequireCaptcha(true);
        showError("Please complete the security verification");
        return;
      }
      
      showError("User already exists. Please login.");
      navigate("/login");
      console.error(error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((form) => ({
      ...form,
      [name]: value.trimStart(),
    }));
  };
  
  return (
    <HoneypotForm
      className="relative space-y-3 rounded-md bg-white p-6 shadow-xl lg:p-10 border border-sky-100 my-10 mx-auto max-w-100"
      onSubmit={handleSignUp}
    >
      <h1 className="text-xl font-semibold lg:text-2xl text-sky-950">
        Sign up
      </h1>
      <p className="text-sky-800">Register to create your account</p>
      <div>
        <label className="text-sky-950 font-medium"> Full Name </label>
        <input
          type="text"
          name="fullName"
          placeholder="John Doe"
          pattern="^[A-Za-z ]{2,}$"
          title="Full name should only contain letters and spaces"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Username </label>
        <input
          type="text"
          name="userName"
          placeholder="johndoe"
          pattern="^[a-zA-Z0-9_]{4,}$"
          title="Username must be at least 4 characters, no spaces"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Email Address </label>
        <input
          type="email"
          name="emailAddress"
          placeholder="username@example.com"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Phone Number </label>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="1234567890"
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit phone number"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Password </label>
        <input
          type="password"
          name="passWord"
          placeholder="**********"
          pattern=".{6,}"
          title="Password must be at least 6 characters"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="text-sky-950 font-medium"> Profile Photo </label>
        <input
          type="file"
          name="profilePhoto"
          accept="image/*"
          required
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
        />
      </div>
      
      {/* Always show CAPTCHA for signup */}
      <div className="flex justify-center my-4">
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key
          onChange={handleCaptchaChange}
        />
      </div>
      
      <div>
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-sky-600 p-2 text-center font-semibold text-white hover:bg-sky-700 cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </HoneypotForm>
  );
};

export default Signup;
