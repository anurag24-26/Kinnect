import { useEffect, useState, useRef } from "react";
import { FaBell, FaSyncAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://kinnectbackend.onrender.com/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Notifications response:", res.data); // Debug here
      setNotifications(res?.data?.notifications || []);
    } catch (err) {
      console.error(
        "❌ Failed to fetch notifications:",
        err?.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial + auto-refresh every 30 seconds
  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `https://kinnectbackend.onrender.com/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("❌ Error marking as read:", err.message);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative focus:outline-none"
      >
        <FaBell className="text-xl text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-xl rounded-lg border z-50 custom-scrollbar">
          <div className="p-3 flex justify-between items-center border-b">
            <span className="font-semibold text-gray-700">Notifications</span>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              title="Refresh"
              className="text-cyan-600 hover:text-cyan-800 transition"
            >
              <FaSyncAlt
                className={`animate-spin ${loading ? "" : "hidden"}`}
              />
              {!loading && <FaSyncAlt />}
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`p-3 border-b text-sm hover:bg-gray-50 cursor-pointer ${
                  n.isRead ? "text-gray-500" : "text-gray-800 font-medium"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-cyan-600 font-bold">
                    @{n.sender?.username}
                  </span>
                  <span>
                    {n.type === "like" && "❤️ liked your post"}
                    {n.type === "comment" && "💬 commented on your post"}
                    {n.type === "follow" && "👤 started following you"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                  {n.post && (
                    <Link
                      to={`/post/${n.post}`}
                      className="text-xs text-cyan-600 hover:underline"
                    >
                      View Post
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
