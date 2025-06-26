import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  AiFillHome,
  AiOutlineSearch,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { FaUserCircle, FaCog, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { BiMessageDetail } from "react-icons/bi";
import { useAuth } from "../contexts/AuthContexts";
import NotificationBell from "./NotificationBell";

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
      <header className="w-full bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <nav className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="text-3xl font-bold text-cyan-700">
            Kinnect
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
              className="px-3 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
            >
              <AiOutlineSearch /> Search
            </button>
          </form>

          {/* Icons & Links */}
          <div className="flex items-center gap-5 text-gray-700 text-sm font-medium">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-cyan-600"
              title="Explore"
            >
              <AiFillHome className="text-lg" />
              <span className="hidden md:inline">Explore</span>
            </Link>

            {user && (
              <>
                {/* <Link
                  to="/create"
                  className="flex items-center gap-1 hover:text-cyan-600"
                  title="Create Post"
                >
                  <AiOutlinePlusCircle className="text-lg" />
                  <span className="hidden md:inline">Create</span>
                </Link> */}

                <Link
                  to="/chat"
                  className="flex items-center gap-1 hover:text-cyan-600"
                  title="Chat"
                >
                  <BiMessageDetail className="text-lg" />
                  <span className="hidden md:inline">Chat</span>
                </Link>

                <NotificationBell />

                <Link
                  to="/settings"
                  className="flex items-center gap-1 hover:text-cyan-600"
                  title="Settings"
                >
                  <FaCog className="text-lg" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-1 hover:text-cyan-600"
                  title="Your Profile"
                >
                  <FaUserCircle className="text-lg" />
                  <span className="hidden md:inline">{user.username}</span>
                </Link>

                {/* <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="hidden md:inline">Logout</span>
                </button> */}
              </>
            )}

            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-1 hover:text-cyan-600"
                title="Login"
              >
                <FaSignInAlt className="text-lg" />
                <span className="hidden md:inline">Login</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="pt-20 px-4 pb-32 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Post Button */}
      {user && (
        <Link
          to="/create"
          title="Create Post"
          className="fixed bottom-6 right-6 md:right-10 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg"
        >
          <AiOutlinePlusCircle className="text-2xl" />
        </Link>
      )}
    </div>
  );
};

export default Layout;
