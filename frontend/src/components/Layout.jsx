import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BiHomeHeart } from "react-icons/bi";
import { AiFillHome } from "react-icons/ai";
import { FaUserCircle, FaPlus } from "react-icons/fa";
import { FiSettings, FiLogIn } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContexts";
import Logosvg from "../assets/kinnectlogo.svg"; // Assuming you have a logo SVG file
const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="w-full bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <nav className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-extrabold "
          >
            <h1 className="cedarville-cursive-regular text-3xl text-black-800">
              Kinnect
            </h1>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />
            <button
              type="submit"
              className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700 text-sm"
            >
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <div className="flex gap-4 items-center text-sm font-medium text-gray-700">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-cyan-600"
            >
              <AiFillHome className="text-lg" />
              Explore
            </Link>

            {user && (
              <Link
                to="/create"
                className="flex items-center gap-1 hover:text-cyan-600"
              >
                <FaPlus className="text-lg" />
                Create
              </Link>
            )}

            {user ? (
              <>
                <span className="hidden md:inline-flex items-center gap-1 text-cyan-700">
                  <FaUserCircle className="text-lg" />
                  <Link to="/profile">{user.username}</Link>
                </span>
                <Link
                  to="/settings"
                  className="flex items-center gap-1 hover:text-cyan-600"
                >
                  <FiSettings className="text-lg" />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 hover:text-cyan-600"
              >
                <FiLogIn className="text-lg" />
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 pb-32 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Create Post Floating Button */}
      {user && (
        <Link
          to="/create"
          className="fixed bottom-6 right-6 md:right-10 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg transition"
          title="Create Post"
        >
          <FaPlus className="text-lg" />
        </Link>
      )}
    </div>
  );
};

export default Layout;
