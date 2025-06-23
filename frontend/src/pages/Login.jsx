import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { FiLogIn } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContexts";
import Logo from "../assets/kinnectlogo.png";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" }); // `identifier` can be email or username

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      login(res.data.token, res.data.user);
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Try again."
      );
      console.error("❌ Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 px-4">
      <div className="w-full max-w-xl bg-white shadow-2xl p-10 rounded-2xl border-t-4 border-cyan-500 flex flex-col items-center">
        {/* Logo Centered */}
        <img src={Logo} alt="Kinnect Logo" className="h-14 w-auto mb-4" />

        {/* Title */}
        <div className="flex items-center gap-2 mb-6 text-cyan-600">
          <FiLogIn className="text-2xl" />
          <h2 className="text-xl font-semibold">Welcome Back!</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 p-3 mb-4 rounded-md text-sm w-full">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <input
            name="identifier"
            placeholder="Email or Username"
            value={form.identifier}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg p-3 disabled:opacity-50 transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Prompt */}
        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
