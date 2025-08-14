import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { FaUserEdit, FaSignOutAlt, FaUpload } from "react-icons/fa";
import PostCard from "../components/PostCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import KinnectLoader from "../components/KinnectLoader";

const Profile = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [comments, setComments] = useState({});
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Fetch posts of logged-in user
  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(
        "https://kinnectbackend.onrender.com/api/posts",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const userPosts = res.data.filter((post) => post.user._id === user._id);
      setPosts(userPosts);
      userPosts.forEach((p) => fetchComments(p._id));
    } catch (err) {
      setError("Failed to load your posts");
    }
  };

  // Fetch comments for each post
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/comments/${postId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch {}
  };

  // Add comment to post
  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      await axios.post(
        "https://kinnectbackend.onrender.com/api/comments",
        { postId, text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchComments(postId);
    } catch {}
  };

  // Fetch followers/following stats
  const fetchFollowStats = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/follows/${user._id}/stats`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchFollowStats();
    }
  }, [user]);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Upload avatar only (separate from profile edit)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      await axios.put(
        "https://kinnectbackend.onrender.com/api/users/update-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Refresh avatar without full reload
      const me = await axios.get(
        `https://kinnectbackend.onrender.com/api/users/${user._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      localStorage.setItem("user", JSON.stringify(me.data.user));
      window.location.reload(); // or update context directly
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <KinnectLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-[#F1F5F9] p-4 sm:p-6">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-28 h-28 shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-cyan-400 shadow-lg">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-full shadow-md transition"
                title="Upload Avatar"
                disabled={uploading}
              >
                <FaUpload size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                hidden
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-cyan-300">
                {user.username}
              </h2>
              <p className="text-sm text-slate-300">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-slate-400 italic">{user.bio}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3 text-sm">
                <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-medium">
                  Posts: {posts.length}
                </span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium">
                  Followers: {followers.length}
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-medium">
                  Following: {following.length}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 px-5 py-2 rounded-full shadow-md transition"
            >
              <FaUserEdit /> Edit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 px-5 py-2 rounded-full shadow-md transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-cyan-200 mb-4 px-2 sm:px-0">
          Your Posts
        </h3>
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {posts.length === 0 ? (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl text-slate-400 text-center shadow-lg">
            You haven’t posted anything yet.
          </div>
        ) : (
          <div className="space-y-6 px-2 sm:px-0">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={{ ...post, comments: comments[post._id] || [] }}
                onAddComment={(text) => handleAddComment(post._id, text)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
