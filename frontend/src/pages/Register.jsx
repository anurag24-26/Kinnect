import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { FiUserPlus } from "react-icons/fi";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );
      console.log("✅ Registration successful:", res.data);

      // Optional: Auto login
      localStorage.setItem("token", res.data.token); // if token returned
      navigate("/");
    } catch (err) {
      console.error(
        "❌ Registration failed:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-200"
      >
        <div className="flex items-center gap-2 mb-6 text-cyan-600">
          <FiUserPlus className="text-2xl" />
          <h2 className="text-xl font-bold">Create Account</h2>
        </div>

        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 rounded-md border border-gray-300"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-3 rounded-md border border-gray-300"
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
          {loading ? "Registering..." : "Register"}
        </Button>

        <p className="mt-3 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
