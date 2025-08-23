import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserEdit, FaSignOutAlt, FaUpload } from "react-icons/fa";
import KinnectLoader from "../components/KinnectLoader";
import PostGridCard from "../components/PostGridCard";
import { useAuth } from "../contexts/AuthContexts";

const ViewProfile = () => {
  const { id } = useParams();
  const { user: loggedInUser, logout } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  // Fetch user
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileUser(res.data.user);
    } catch (err) {
      setError("Failed to load user profile.");
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/posts/user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(res.data || []);
    } catch {
      setError("Failed to load posts.");
    }
  };

  // Fetch follow stats
  const fetchFollowStats = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/follows/${id}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);

      const myId = loggedInUser?._id;
      const isUserFollowing = res.data.followers.some((f) => f._id === myId);
      setIsFollowing(isUserFollowing);
    } catch {
      console.error("Failed to load follow stats");
    }
  };

  useEffect(() => {
    if (!token) return setError("Unauthorized. Please log in.");
    fetchUser();
    fetchPosts();
    fetchFollowStats();
  }, [id]);

  // Follow/Unfollow
  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      await axios.post(
        `https://kinnectbackend.onrender.com/api/follows/${id}/${
          isFollowing ? "unfollow" : "follow"
        }`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(!isFollowing);
      setFollowers((prev) =>
        isFollowing ? prev.filter((f) => f._id !== loggedInUser._id) : [...prev, loggedInUser]
      );
    } catch {
      alert("Failed to update follow status.");
    } finally {
      setLoading(false);
    }
  };

  if (!profileUser) return <KinnectLoader />;

  const isOwnProfile = profileUser._id === loggedInUser._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-[#F1F5F9] p-4 sm:p-6">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-10 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Avatar + Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-28 h-28 shrink-0">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-cyan-400 shadow-lg">
                  {profileUser.username[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-cyan-300">
                {profileUser.username}
              </h2>
              <p className="text-sm text-slate-300">{profileUser.email}</p>
              {profileUser.bio && (
                <p className="text-sm text-slate-400 italic">{profileUser.bio}</p>
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
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 px-5 py-2 rounded-full shadow-md transition"
                >
                  <FaUserEdit /> Edit
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 px-5 py-2 rounded-full shadow-md transition"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={loading}
                className={`px-5 py-2 rounded-full shadow-md transition ${
                  isFollowing
                    ? "bg-gradient-to-r from-red-500 to-pink-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                }`}
              >
                {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-cyan-200 mb-4 px-2 sm:px-0">
          {isOwnProfile ? "Your Posts" : `${profileUser.username}'s Posts`}
        </h3>
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {posts.length === 0 ? (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl text-slate-400 text-center shadow-lg">
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostGridCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
