
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login when the website loads
  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await axios.get(
          `${API}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setUser(data);
        }
      } catch (error) {
        if (active) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  // Save login information
  const saveSession = (data) => {
    if (!data?.token || !data?.user) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
    setLoading(false);
  };

  // Email and Password Login
  const login = async (email, password) => {
    const { data } = await axios.post(
      `${API}/auth/login`,
      { email, password }
    );

    saveSession(data);
    return data.user;
  };

  // Register New Account
  const register = async (payload) => {
    const { data } = await axios.post(
      `${API}/auth/register`,
      payload
    );

    saveSession(data);
    return data.user;
  };

  // Google Login
  const googleLogin = async (credential) => {
    const { data } = await axios.post(
      `${API}/auth/google`,
      { credential }
    );

    saveSession(data);
    return data.user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        API,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);
