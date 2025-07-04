import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
const Navbar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const { isLoggedIn, logout, user } = useAuth();
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/user/id/${userId}`
        );
        setUserInfo(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, [userId]);
  const cartCount = useSelector((state) =>
    state.cart.reduce((total, product) => total + product.quantity, 0)
  );
  const wishlistCount = useSelector((state) => state.wishlist.length);
  return (
    <header className="bg-white text-sky-950 sticky flex flex-col overflow-hidden px-4 py-2 md:flex-row md:items-center shadow top-0 z-50">
      <Link
        to="/"
        className="flex items-center whitespace-nowrap text-2xl font-black"
      >
        NextBuy
      </Link>
      <input type="checkbox" className="peer hidden" id="navbar-open" />
      <label
        className="absolute top-3 right-5 cursor-pointer md:hidden"
        htmlFor="navbar-open"
      >
        <svg
          className="h-7 w-7"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </label>
      <nav
        aria-label="Header Navigation"
        className="peer-checked:pt-8 peer-checked:max-h-60 flex max-h-0 w-full flex-col items-center overflow-hidden transition-all md:ml-24 md:max-h-full md:flex-row"
      >
        <ul className="flex w-full flex-col items-start space-y-2 md:flex-row md:justify-center md:space-y-0">
          <li className="md:mr-12">
            <Link
              className="font-medium transition-all duration-200 hover:text-sky-800"
              to="/"
            >
              Home
            </Link>
          </li>
          <li className="md:mr-12">
            <Link
              className="relative font-medium transition-all duration-200 hover:text-sky-800"
              to="/wishlist"
            >
              Wishlist
              {isLoggedIn ? (
                <span className="absolute bottom-2  rounded-full bg-sky-800 text-white px-1 text-xs">
                  {wishlistCount}
                </span>
              ) : (
                <></>
              )}
            </Link>
          </li>
          <li className="md:mr-12">
            <Link
              className="relative font-medium transition-all duration-200 hover:text-sky-800"
              to="/cart"
            >
              Cart
              {isLoggedIn ? (
                <span className="absolute bottom-2  rounded-full bg-sky-800 text-white px-1 text-xs">
                  {cartCount}
                </span>
              ) : (
                <></>
              )}
            </Link>
          </li>
        </ul>
        <hr className="mt-4 w-full md:hidden" />
        {!user && !isLoggedIn ? (
          <div className="my-4 flex self-start items-center space-x-6 space-y-2 md:my-0 md:ml-auto md:space-x-8 md:space-y-0">
            <Link
              to="/login"
              title=""
              className="whitespace-nowrap font-medium transition-all duration-200 hover:text-sky-800"
            >
              Login
            </Link>
            <Link
              to="/signup"
              title=""
              className="whitespace-nowrap rounded-xl bg-sky-700 px-4 py-2 font-medium text-sky-50 transition-all duration-200 hover:bg-sky-900"
            >
              Signup
            </Link>
          </div>
        ) : (
          <div className="my-4 flex self-start items-center space-x-6 space-y-2 md:my-0 md:ml-auto md:space-x-8 md:space-y-0">
            <Link
              to={`/profile/${userInfo?.userName}`}
              className="flex justify-center items-center gap-2"
            >
              <img
                className="w-10 rounded-full object-contain"
                src={
                  user?.profilePhoto
                    ? `http://localhost:5000/${user.profilePhoto.replace(
                        /\\/g,
                        "/"
                      )}`
                    : "/default-avatar.png"
                }
                alt=""
              />

              <span className="italic">{userInfo?.userName}</span>
            </Link>
            <button
              to=""
              className="whitespace-nowrap font-medium transition-all duration-200 hover:text-sky-800 cursor-pointer"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
