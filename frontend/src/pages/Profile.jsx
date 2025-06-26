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
  const [comments, setComments] = useState({}); // postId -> [comments]
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(
        "https://kinnectbackend.onrender.com/api/posts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const userPosts = res.data.filter((post) => post.user._id === user._id);
      setPosts(userPosts);

      for (let post of userPosts) {
        fetchComments(post._id);
      }
    } catch (err) {
      setError("Failed to load your posts");
      console.error(
        "❌ Fetch user posts error:",
        err.response?.data || err.message
      );
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/comments/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(
        "❌ Fetch comments error:",
        err.response?.data || err.message
      );
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      await axios.post(
        "https://kinnectbackend.onrender.com/api/comments",
        { postId, text },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchComments(postId);
    } catch (err) {
      console.error(
        "❌ Add comment failed:",
        err.response?.data || err.message
      );
    }
  };

  const fetchFollowStats = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/follows/${user._id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
    } catch (err) {
      console.error(
        "❌ Failed to fetch follow stats:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchFollowStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      await axios.patch(
        "https://kinnectbackend.onrender.com/api/users/me/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      window.location.reload();
    } catch (err) {
      console.error(
        "❌ Avatar upload failed:",
        err.response?.data || err.message
      );
      alert("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <KinnectLoader />;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-5 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-24 h-24 shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-cyan-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-3xl font-bold border-4 border-cyan-500">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-cyan-600 hover:bg-cyan-700 text-white p-1 rounded-full shadow-md transition"
                title="Upload Avatar"
              >
                <FaUpload size={12} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                hidden
                disabled={uploading}
              />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {user.username}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.bio}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3 text-sm">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-medium">
                  Posts: {posts.length}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  Followers: {followers.length}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  Following: {following.length}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-md transition text-sm"
            >
              <FaUserEdit /> Edit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-md transition text-sm"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 px-2 sm:px-0">
          Your Posts
        </h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {posts.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-center">
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
