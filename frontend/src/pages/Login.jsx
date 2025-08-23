import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../contexts/AuthContexts";
import Logo from "../assets/kinnectlogo.png";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
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
        "https://kinnectbackend.onrender.com/api/auth/login",
        form
      );
      login(res.data.token, res.data.user);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#16161A] text-[#FFFFFE] px-4">
      <div className="w-full max-w-md bg-[#1F1F24] p-8 rounded-2xl shadow-lg border border-[#2CB67D]/20">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={Logo} 
            alt="Kinnect Logo" 
            className="h-20 md:h-24 object-contain drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6 justify-center">
         <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D]">
            Welcome Back
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 p-3 mb-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="identifier"
            placeholder="Email or Username"
            value={form.identifier}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-[#2A2A30] border border-transparent focus:border-[#7F5AF0] focus:ring-2 focus:ring-[#7F5AF0]/50 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-[#2A2A30] border border-transparent focus:border-[#7F5AF0] focus:ring-2 focus:ring-[#7F5AF0]/50 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-sm text-center text-[#94A1B2]">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#FF8906] font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
