import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdCampaign } from "react-icons/md";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContexts";
import KinnectLoader from "../components/KinnectLoader";
import axios from "axios";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [postsLoading, setPostsLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const showLoader = authLoading || postsLoading;

  const fetchPosts = async () => {
    setPostsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }
      const res = await axios.get(
        "https://kinnectbackend.onrender.com/api/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts(res.data);
    } catch (err) {
      setError("Something went wrong while loading your feed.");
      setPosts([]);
      console.error("❌ Post fetch error:", err.response?.data || err.message);
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) fetchPosts();
    if (!authLoading && !user) setPosts([]);
  }, [authLoading, user]);

  // Loader state
  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100">
        <KinnectLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-gray-900 p-5">
      <div className="max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
          <MdCampaign className="text-cyan-600 text-3xl animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-cyan-700">
            Community Feed
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-lg text-red-600 text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* States */}
        {!user ? (
          // Logged Out State
          <div className="mt-20 text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome to <span className="text-cyan-600">Kinnect</span> ✨
            </h2>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Join our vibrant community and start sharing your thoughts, stories,
              and moments with people around the world.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <Link
                to="/login"
                className="bg-cyan-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-cyan-700 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-full shadow-sm hover:bg-gray-100 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          // No Posts Yet
          <div className="mt-20 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-800">
              No posts in your feed… yet!
            </h3>
            <p className="text-gray-500 mt-1">
              Be the first to share something with the community.
            </p>
            <Link
              to="/create"
              className="mt-6 inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-2 rounded-full shadow-lg hover:from-cyan-600 hover:to-cyan-700 transition-all"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          // Posts List
          <div className="space-y-5 animate-fadeIn">
            {posts.map((post, i) => (
              <PostCard key={post._id || i} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
