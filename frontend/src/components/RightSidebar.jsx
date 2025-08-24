import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaUserPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";

const suggestedUsers = [
  { username: "sarah_dev", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { username: "johnny42", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { username: "amalthea", avatar: "https://randomuser.me/api/portraits/women/87.jpg" },
];

const RightSidebar = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(true); // ✅ collapse state
  const token = localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        "https://kinnectbackend.onrender.com/api/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res?.data?.notifications || []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending hashtags
  const fetchTrendingTags = async () => {
    try {
      setLoadingTags(true);
      const res = await axios.get("https://kinnectbackend.onrender.com/api/posts/trending-hashtags");
      setTrendingTags(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch trending hashtags:", err?.response?.data || err.message);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchTrendingTags();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Mark as read
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

  // Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://kinnectbackend.onrender.com/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("❌ Error deleting notification:", err.message);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-80 shrink-0 pt-8 px-6 bg-[#181920] border-l border-[#2CB67D]/10 min-h-screen">
      
      {/* Notifications */}
      <section>
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setOpenNotifications((prev) => !prev)}
        >
          <h3 className="text-lg font-bold text-[#2CB67D]">Notifications</h3>
          {openNotifications ? (
            <FaChevronUp className="text-[#2CB67D]" />
          ) : (
            <FaChevronDown className="text-[#2CB67D]" />
          )}
        </div>

        {openNotifications && (
          <div className="flex flex-col divide-y divide-[#2CB67D]/30 max-h-96 overflow-y-auto rounded-lg bg-[#22243e] p-2 transition-all">
            {loading ? (
              <p className="text-gray-400 text-sm italic p-2">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-400 text-sm italic p-2">No new notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 flex items-start gap-3 rounded-md hover:bg-[#2CB67D]/20 transition ${
                    n.isRead ? "text-gray-400" : "text-white font-semibold"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 text-cyan-400 mt-1">
                    {n.type === "like" && <FaHeart />}
                    {n.type === "comment" && <FaComment />}
                    {n.type === "follow" && <FaUserPlus />}
                  </div>

                  {/* Content */}
                  <div
                    className="flex flex-col flex-1 cursor-pointer"
                    onClick={() => handleMarkAsRead(n._id)}
                  >
                    <span className="text-cyan-400">@{n.sender?.username}</span>
                    <span>
                      {n.type === "like" && "liked your post"}
                      {n.type === "comment" && "commented on your post"}
                      {n.type === "follow" && "started following you"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.post && (
                      <Link
                        to={`/post/${n.post}`}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        View Post
                      </Link>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Who to follow */}
      <section>
        <h3 className="text-lg font-bold text-[#2CB67D] mb-3">Who to follow</h3>
        <div className="flex flex-col gap-4">
          {suggestedUsers.map((user) => (
            <Link
              to={`/profile/${user.username}`}
              key={user.username}
              className="flex items-center gap-2 hover:bg-[#22243e] rounded-lg px-2 py-1 transition"
            >
              <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-white text-sm">@{user.username}</span>
              <button className="ml-auto px-3 py-0.5 text-xs rounded-full bg-gradient-to-r from-[#2CB67D] to-[#7F5AF0] text-white hover:scale-110 transition">
                Follow
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-full">
        <h3 className="text-lg font-bold text-[#7F5AF0] mb-3">Trending</h3>
        <div className="flex flex-wrap gap-2 overflow-hidden break-words">
          {loadingTags ? (
            <p className="text-gray-400 text-sm italic">Loading...</p>
          ) : trendingTags.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No trending hashtags</p>
          ) : (
            trendingTags.map((tag) => (
              <Link
                to={`/explore?tag=${tag._id.replace("#", "")}`}
                key={tag._id}
                className="bg-gradient-to-r from-[#7F5AF0]/20 to-[#2CB67D]/20 
                  px-3 py-1 rounded-full text-xs text-pink-300 
                  border border-white/10 hover:scale-105 transition
                  truncate max-w-[120px] text-center"
              >
                {tag._id} ({tag.count})
              </Link>
            ))
          )}
        </div>
      </section>
      
    </aside>
  );
};

export default RightSidebar;
