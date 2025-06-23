import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUserPlus } from "react-icons/fi";
import Button from "../components/Button";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        "http://localhost:5000/api/auth/register",
        form
      );
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message === "Username already exists"
          ? "Username is already taken. Please choose another."
          : err.response?.data?.message ||
              "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 px-4">
      <div className="w-full max-w-xl bg-white shadow-2xl p-10 rounded-2xl border-t-4 border-cyan-500">
        {/* Logo or App name */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-cyan-600">Kinnect</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Connect seamlessly with your world 🌐
          </p>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6 text-cyan-600">
          <FiUserPlus className="text-2xl" />
          <h2 className="text-xl font-semibold">Create Your Kinnect Account</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 p-3 mb-4 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className={`w-full p-3 rounded-lg border ${
              error.includes("Username") ? "border-red-400" : "border-gray-300"
            } focus:ring-2 focus:ring-cyan-500 outline-none`}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
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

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg p-3 disabled:opacity-50 transition-all"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-600 font-medium hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
