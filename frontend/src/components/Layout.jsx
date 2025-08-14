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
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold text-cyan-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800 flex flex-col">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6">

          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-cyan-700 hover:text-cyan-600 transition-colors">
            Kinnect
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-white/80 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-cyan-400 transition"
          >
            <AiOutlineSearch className="text-gray-500 text-lg" />
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none px-2 text-sm flex-1"
            />
            <button
              type="submit"
              className="ml-2 text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-full text-sm transition-colors"
            >
              Search
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-cyan-600 flex items-center gap-1">
              <AiFillHome className="text-lg" /> Explore
            </Link>

            {user ? (
              <>
                <Link to="/chat" className="hover:text-cyan-600 flex items-center gap-1">
                  <BiMessageDetail className="text-lg" /> Chat
                </Link>
                <NotificationBell />
                <Link to="/settings" className="hover:text-cyan-600">
                  <FaCog className="text-lg" />
                </Link>
                <Link to="/profile" className="hover:text-cyan-600 flex items-center gap-1">
                  <FaUserCircle className="text-lg" /> {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-cyan-600 flex items-center gap-1">
                <FaSignInAlt className="text-lg" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-2xl text-cyan-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <div className={`fixed right-0 top-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cyan-700">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-2xl">
                <HiX />
              </button>
            </div>

            {/* Search in Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-4">
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-full text-sm"
              />
              <button type="submit" className="bg-cyan-600 text-white p-2 rounded-full">
                <AiOutlineSearch />
              </button>
            </form>

            {/* Menu Links */}
            <div className="flex flex-col gap-4 p-4 text-gray-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-cyan-600">
                <AiFillHome /> Explore
              </Link>
              {user ? (
                <>
                  <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-cyan-600">
                    <BiMessageDetail /> Chat
                  </Link>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-cyan-600">
                    <FaCog /> Settings
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-cyan-600">
                    <FaUserCircle /> {user.username}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-cyan-600">
                  <FaSignInAlt /> Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="pt-20 px-4 pb-32 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Floating Create Button (FAB) */}
      {user && (
        <Link
          to="/create"
          title="Create Post"
          className="fixed bottom-6 right-6 md:right-10 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white p-4 rounded-full shadow-xl hover:scale-110 transform transition-all"
        >
          <AiOutlinePlusCircle className="text-2xl" />
        </Link>
      )}
    </div>
  );
};

export default Layout;
