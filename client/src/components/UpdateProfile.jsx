import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { showError, showSuccess } from "../utils/notification";

const UpdateProfile = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    emailAddress: "",
    phoneNumber: "",
    profilePhoto: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/user/id/${id}`
        );
        setUserData(res.data);
        setForm({
          fullName: res.data.fullName || "",
          userName: res.data.userName || "",
          emailAddress: res.data.emailAddress || "",
          phoneNumber: res.data.phoneNumber || "",
          profilePhoto: null,
        });
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        form.fullName === "" ||
        form.userName === "" ||
        form.emailAddress === "" ||
        form.phoneNumber === "" ||
        (!form.profilePhoto && !userData.profilePhoto)
      ) {
        showError("Please fill all the required details");
        return;
      } else {
        const formData = new FormData();
        for (const key in form) {
          if (form[key]) formData.append(key, form[key]);
        }

        const res = await axios.put(
          `http://localhost:5000/api/auth/user/id/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        showSuccess("Profile updated successfully");

        const updatedUser = res.data.user;

        setUser(updatedUser); // update context with actual data, not formData
        localStorage.setItem("user", JSON.stringify(updatedUser)); // optional
        console.log("🔁 Navigating to:", `/profile/${updatedUser.userName}`);
        console.log("✅ Updated user:", updatedUser);

        navigate(`/profile/${updatedUser.userName}`);
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Failed to update profile:", error);
      showError("Update failed. Please try again later.");
    }
  };

  if (!userData) {
    return <div className="text-center mt-10 text-sky-800">Loading...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-3 rounded-md bg-white p-6 shadow-xl lg:p-10 border border-sky-100 my-10 mx-auto max-w-100"
    >
      <h1 className="text-xl font-semibold lg:text-2xl text-sky-950">
        Update Profile
      </h1>

      <div>
        <label className="text-sky-950 font-medium">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          pattern="^[A-Za-z ]{2,}$"
          title="Full name should only contain letters and spaces"
          placeholder="John Doe"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          required
        />
      </div>

      <div>
        <label className="text-sky-950 font-medium">Username</label>
        <input
          type="text"
          name="userName"
          value={form.userName}
          onChange={handleChange}
          pattern="^[a-zA-Z0-9_]{4,}$"
          title="Username must be at least 4 characters, no spaces"
          placeholder="johndoe"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          required
        />
      </div>

      <div>
        <label className="text-sky-950 font-medium">Email Address</label>
        <input
          type="email"
          name="emailAddress"
          value={form.emailAddress}
          onChange={handleChange}
          placeholder="username@example.com"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          required
        />
      </div>

      <div>
        <label className="text-sky-950 font-medium">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="1234567890"
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit phone number"
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
          required
        />
      </div>

      <div>
        <label className="text-sky-950 font-medium">Profile Photo</label>
        <input
          type="file"
          name="profilePhoto"
          accept="image/*"
          onChange={handleChange}
          className="mt-2 h-12 w-full rounded-md bg-gray-100 px-3 focus:outline-sky-600"
        />
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-md bg-sky-600 p-2 text-center font-semibold text-white hover:bg-sky-700 cursor-pointer"
      >
        Update
      </button>
    </form>
  );
};

export default UpdateProfile;
