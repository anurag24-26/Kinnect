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
  const [postsLoading, setPostsLoading] = useState(false); // NEW: loading for posts

  const { user, loading: authLoading } = useAuth();

  // Show loader if either auth or posts are loading
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
      setError("Failed to load posts");
      setPosts([]);
      console.error("❌ Post fetch error:", err.response?.data || err.message);
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPosts();
    }
    if (!authLoading && !user) {
      setPosts([]); // cleanup posts if logged out
    }
  }, [authLoading, user]);

  // Show loader *any* time something's loading
  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <KinnectLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
          <MdCampaign className="text-cyan-600 text-3xl" />
          Latest Posts
        </h1>

        {error && (
          <p className="text-red-500 mb-4 border px-4 py-2 bg-red-50 rounded">
            {error}
          </p>
        )}

        {!user ? (
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">
              Please{" "}
              <span className="font-semibold text-cyan-700">log in</span> or{" "}
              <span className="font-semibold text-cyan-700">register</span> to see posts.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                Register
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center mt-16 text-gray-500">No posts yet.</div>
        ) : (
          <div className="space-y-4">
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
