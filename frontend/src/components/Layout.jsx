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
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold text-[#2CB67D]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16161A] text-[#FFFFFE] flex flex-col font-inter">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#16161A]/80 backdrop-blur-md border-b border-[#2CB67D]/30 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent hover:opacity-90 transition"
          >
            Kinnect
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center bg-[#16161A] border border-[#94A1B2]/30 rounded-full px-4 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#7F5AF0] transition"
          >
            <AiOutlineSearch className="text-[#94A1B2]" />
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none px-2 text-sm flex-1 text-[#FFFFFE]"
            />
            <button
              type="submit"
              className="ml-2 text-sm px-3 py-1 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white hover:scale-105 transition-all"
            >
              Search
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-[#2CB67D] flex items-center gap-1">
              <AiFillHome className="text-lg" /> Explore
            </Link>
            {user ? (
              <>
                <Link to="/chat" className="hover:text-[#2CB67D] flex items-center gap-1">
                  <BiMessageDetail className="text-lg" /> Chat
                </Link>
                <NotificationBell />
                <Link to="/settings" className="hover:text-[#2CB67D]">
                  <FaCog className="text-lg" />
                </Link>
                <Link to="/profile" className="hover:text-[#2CB67D] flex items-center gap-1">
                  <FaUserCircle className="text-lg" /> {user.username}
                </Link>
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] hover:from-[#2CB67D] hover:to-[#7F5AF0] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <AiOutlinePlusCircle className="text-lg" /> Create
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[#E63946] hover:brightness-125 flex items-center gap-1"
                >
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-[#2CB67D] flex items-center gap-1">
                <FaSignInAlt className="text-lg" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-2xl text-[#7F5AF0]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div
            className={`fixed right-0 top-0 h-full w-72 bg-[#16161A] z-50 shadow-lg rounded-l-3xl transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-[#94A1B2]/30 flex items-center justify-between">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent">
                Menu
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl text-[#94A1B2]"
              >
                <HiX />
              </button>
            </div>

            {/* Search in Mobile */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 p-4"
            >
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-[#94A1B2]/30 rounded-full text-sm bg-transparent text-[#FFFFFE]"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white p-2 rounded-full"
              >
                <AiOutlineSearch />
              </button>
            </form>

            {/* Menu Links */}
            <div className="flex flex-col gap-4 p-4 text-[#94A1B2] animate-slideIn">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 hover:text-[#2CB67D] transition-transform duration-200 hover:translate-x-1"
              >
                <AiFillHome /> Explore
              </Link>
              {user ? (
                <>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 hover:text-[#2CB67D] transition-transform duration-200 hover:translate-x-1"
                  >
                    <BiMessageDetail /> Chat
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 hover:text-[#2CB67D] transition-transform duration-200 hover:translate-x-1"
                  >
                    <FaCog /> Settings
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 hover:text-[#2CB67D] transition-transform duration-200 hover:translate-x-1"
                  >
                    <FaUserCircle /> {user.username}
                  </Link>
                  <Link
                    to="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-white bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] px-3 py-1.5 rounded-full hover:from-[#2CB67D] hover:to-[#7F5AF0] transition-all"
                  >
                    <AiOutlinePlusCircle /> Create
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-[#E63946] hover:brightness-125"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-[#2CB67D] transition-transform duration-200 hover:translate-x-1"
                >
                  <FaSignInAlt /> Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="pt-20 px-4 pb-12 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
