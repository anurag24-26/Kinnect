import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AiFillHome,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { BiCompass, BiMessageDetail } from "react-icons/bi";
import { FaUserCircle, FaCog, FaSignOutAlt, FaSignInAlt, FaBell, FaBars } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../contexts/AuthContexts";
import Logo from "../assets/kinnectlogo.png";

const MobileNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get("https://kinnectbackend.onrender.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res?.data?.notifications || []);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-[#1E1E24] border-b border-gray-700 flex items-center justify-between px-4 py-3 z-50">
        {/* Drawer Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="text-gray-300 hover:text-white"
        >
          <FaBars className="text-xl" />
        </button>

        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Kinnect"
            className="w-8 h-8 object-contain rounded-xl border border-[#7F5AF0]/40"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent">
            Kinnect
          </span>
        </Link>

        {/* Profile or Login */}
        {user ? (
          <Link to="/profile">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-[#7F5AF0]/40"
              />
            ) : (
              <FaUserCircle className="text-2xl text-[#2CB67D]" />
            )}
          </Link>
        ) : (
          <Link to="/login">
            <FaSignInAlt className="text-xl text-[#7F5AF0]" />
          </Link>
        )}
      </header>

      {/* Bottom Navigation (icons only, under content) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1E1E24] border-t border-gray-700 flex justify-around py-2 z-40">
        <Link to="/" className="flex flex-col items-center text-xs">
          <AiFillHome className="text-xl" />
          Home
        </Link>
        <Link to="/explore" className="flex flex-col items-center text-xs">
          <BiCompass className="text-xl" />
          Explore
        </Link>
        {user && (
          <>
            <Link to="/chat" className="flex flex-col items-center text-xs">
              <BiMessageDetail className="text-xl" />
              Chat
            </Link>
            <Link to="/create" className="flex flex-col items-center text-xs">
              <AiOutlinePlusCircle className="text-xl" />
              Create
            </Link>
          </>
        )}
      </nav>

      {/* Drawer with Notifications + Settings */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="w-4/5 max-w-sm bg-[#181920] h-full shadow-lg p-4 overflow-y-auto">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-right w-full mb-4 text-gray-400 hover:text-white"
            >
              ✕ Close
            </button>

            {/* Notifications */}
            <section className="mb-6">
              <h3 className="text-lg font-bold text-[#2CB67D] mb-3 flex items-center gap-2">
                <FaBell /> Notifications
              </h3>
              <div className="flex flex-col divide-y divide-[#2CB67D]/30">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="p-2 text-sm text-white hover:bg-[#2CB67D]/10 rounded"
                    >
                      @{n.sender?.username} {n.type}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Settings */}
            <section>
              <h3 className="text-lg font-bold text-[#7F5AF0] mb-3">Settings</h3>
              <div className="flex flex-col gap-3">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 text-gray-300 hover:text-white"
                >
                  <FaCog /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-400 hover:text-red-600"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar;
