import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
const ProtectedRoutes = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoutes;
