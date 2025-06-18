// src/components/Layout.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BiHomeHeart } from "react-icons/bi";
import { AiFillHome } from "react-icons/ai";
import { FaUser, FaUserCircle, FaPlus } from "react-icons/fa";
import { FiSettings, FiLogIn, FiLogOut } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContexts";

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            className="flex items-center gap-2 text-2xl font-extrabold text-cyan-600"
          >
            <BiHomeHeart className="text-3xl" />
            Kinnect
          </Link>

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
                {/* <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-red-500"
                >
                  <FiLogOut className="text-lg" />
                  Logout
                </button> */}
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

      {/* Create Post Button */}
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
