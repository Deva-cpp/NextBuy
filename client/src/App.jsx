import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ProductDetails from "./components/ProductDetails";
import Wishlist from "./components/Wishlist";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Checkout from "./components/Checkout";
import ProtectedRoutes from "./components/ProtectedRoutes";
import BotProtectedRoute from "./components/BotProtectedRoute";
import UpdateProfile from "./components/UpdateProfile";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initBotProtection } from "./utils/botProtection";

const App = () => {
  useEffect(() => {
    // Initialize bot protection when the app loads
    initBotProtection();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <Home />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/product/:id"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <ProductDetails />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/wishlist"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <Wishlist />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/cart"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <Cart />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/checkout"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute requireCaptcha={true}>
                <Checkout />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <Profile />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route
          path="/user/id/:id"
          element={
            <ProtectedRoutes>
              <BotProtectedRoute>
                <UpdateProfile />
              </BotProtectedRoute>
            </ProtectedRoutes>
          }
        ></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
