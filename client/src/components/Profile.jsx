import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
  const userName = userData?.userName;

  useEffect(() => {
    if (!userName) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/user/${userName}`
        );
        setUser(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [userName]);

  if (!user)
    return (
      <div className="text-center mt-10 text-sky-800">Loading profile...</div>
    );

  return (
    <div className="m-5 sm:m-10">
      <div className="rounded-lg border border-sky-100 bg-white px-4 pt-8 pb-10 shadow-lg flex flex-col gap-4">
        <div className="relative mx-auto w-38 rounded-full">
          <span className="absolute right-0 m-3 h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-300 ring-offset-2"></span>
          <img
            className="mx-auto h-auto w-full rounded-full border-4 p-1 border-sky-800"
            src={
              user?.profilePhoto
                ? `http://localhost:5000/${user.profilePhoto.replace(
                    /\\/g,
                    "/"
                  )}`
                : "/default-avatar.png"
            }
            alt={user?.userName || "User Avatar"}
          />
        </div>

        <h1 className="text-center text-3xl font-bold text-sky-950">
          {user.fullName}
        </h1>
        <p className="text-center text-md font-medium text-sky-800">
          {user.emailAddress}
        </p>

        <ul className="mt-3 divide-y rounded bg-gray-100 py-2 px-3 text-gray-600 shadow-sm">
          <li className="flex justify-between py-3 text-sm">
            <span>Full Name</span>
            <span>{user.fullName}</span>
          </li>
          <li className="flex justify-between py-3 text-sm">
            <span>Username</span>
            <span>{user.userName}</span>
          </li>
          <li className="flex justify-between py-3 text-sm">
            <span>Email Address</span>
            <span>{user.emailAddress}</span>
          </li>
          <li className="flex justify-between py-3 text-sm">
            <span>Phone Number</span>
            <span>{user.phoneNumber}</span>
          </li>
        </ul>

        <Link
          className="mt-4 text-white bg-green-600 px-4 py-2 text-sm font-medium rounded-md hover:bg-green-700 self-start"
          to={`/user/id/${user._id}`}
        >
          Update Profile
        </Link>
      </div>
    </div>
  );
};

export default Profile;
