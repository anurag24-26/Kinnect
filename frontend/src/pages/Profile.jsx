import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { FaUserEdit, FaSignOutAlt, FaUpload } from "react-icons/fa";
import PostCard from "../components/PostCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const userPosts = res.data.filter((post) => post.user._id === user._id);
      setPosts(userPosts);
    } catch (err) {
      setError("Failed to load your posts");
      console.error(
        "❌ Fetch user posts error:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (user) fetchUserPosts();
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
      const res = await axios.patch(
        "http://localhost:5000/api/users/me/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      window.location.reload(); // reload to reflect avatar update
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

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-2xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full shadow-lg"
              title="Upload Avatar"
            >
              <FaUpload size={14} />
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

          <div>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="text-sm mt-1 text-gray-500 flex gap-4">
              <span>Posts: {posts.length}</span>
              <span>Followers: {user.followers?.length || 0}</span>
              <span>Following: {user.following?.length || 0}</span>
            </div>
          </div>

          <div className="ml-auto flex gap-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            >
              <FaUserEdit />
              Edit
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Your Posts</h3>

        {error && <p className="text-red-500">{error}</p>}

        {posts.length === 0 ? (
          <p className="text-gray-500">You haven't posted anything yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
