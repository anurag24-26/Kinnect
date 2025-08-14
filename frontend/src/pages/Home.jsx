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

  if (showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#16161A] text-[#FFFFFE]">
        <KinnectLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16161A] text-[#FFFFFE] px-5 py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#94A1B2]">
          <MdCampaign className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent">
            Community Feed
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-[#E63946] bg-[#E63946]/10 text-[#E63946] text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* States */}
        {!user ? (
          // Logged Out State
          <div className="mt-20 text-center space-y-4">
            <h2 className="text-xl font-semibold">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] bg-clip-text text-transparent">
                Kinnect
              </span>{" "}
              ✨
            </h2>
            <p className="text-[#94A1B2] max-w-md mx-auto leading-relaxed">
              Join our vibrant community and start sharing your thoughts, stories,
              and moments with people around the world.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <Link
                to="/login"
                className="px-5 py-2 rounded-full shadow-lg text-white bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full border border-[#94A1B2] text-[#94A1B2] hover:border-[#7F5AF0] hover:text-white hover:bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          // No Posts Yet
          <div className="mt-20 text-center">
            <div className="text-[#94A1B2] text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold">No posts in your feed… yet!</h3>
            <p className="text-[#94A1B2] mt-1">
              Be the first to share something with the community.
            </p>
            <Link
              to="/create"
              className="mt-6 inline-block px-6 py-2 rounded-full shadow-lg text-white bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] hover:scale-105 transition-transform"
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
