import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { FiLogIn } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContexts"; // ✅ Import useAuth

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✅ Destructure login function from context
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      console.log("✅ Logged in:", res.data);
      login(res.data.token, res.data.user); // ✅ Save to context
      navigate("/profile"); // ✅ Redirect to profile
    } catch (err) {
      console.error(
        "❌ Login failed:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-6 text-cyan-600">
          <FiLogIn className="text-2xl" />
          <h2 className="text-xl font-bold">Welcome back</h2>
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-md border border-gray-300"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-6 rounded-md border border-gray-300"
        />

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Link
          to="/register"
          className="block mt-4 text-center text-sm text-cyan-600 hover:underline"
        >
          Don’t have an account? Register
        </Link>
      </form>
    </div>
  );
};

export default Login;
