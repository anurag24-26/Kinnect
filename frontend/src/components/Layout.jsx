import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  AiFillHome,
  AiOutlineSearch,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import {
  FaUserCircle,
  FaCog,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { BiMessageDetail } from "react-icons/bi";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContexts";
import NotificationBell from "./NotificationBell";

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${searchQuery.trim()}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
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
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-cyan-700"
          >
            Kinnect
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
            >
              <AiOutlineSearch />
              Search
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-cyan-600 flex items-center gap-1">
              <AiFillHome className="text-lg" />
              Explore
            </Link>

            {user ? (
              <>
                <Link to="/chat" className="hover:text-cyan-600 flex items-center gap-1">
                  <BiMessageDetail className="text-lg" />
                  Chat
                </Link>

                <NotificationBell />

                <Link to="/settings" className="hover:text-cyan-600">
                  <FaCog className="text-lg" />
                </Link>

                <Link to="/profile" className="hover:text-cyan-600 flex items-center gap-1">
                  <FaUserCircle className="text-lg" />
                  {user.username}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <FaSignOutAlt className="text-lg" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-cyan-600 flex items-center gap-1">
                <FaSignInAlt className="text-lg" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-2xl text-cyan-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4 text-sm">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-md text-sm"
              />
              <button
                type="submit"
                className="bg-cyan-600 text-white px-3 py-1.5 rounded"
              >
                <AiOutlineSearch />
              </button>
            </form>

            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <AiFillHome />
              Explore
            </Link>
            {user ? (
              <>
                <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <BiMessageDetail />
                  Chat
                </Link>

                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <FaCog />
                  Settings
                </Link>

                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <FaUserCircle />
                  {user.username}
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <FaSignInAlt />
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 px-4 pb-32 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Create Button */}
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
