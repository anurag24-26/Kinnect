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

  const { user, loading } = useAuth();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

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
      console.error("❌ Post fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPosts();
    }
  }, [loading, user]);

  if (loading) {
    return <KinnectLoader />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
          <MdCampaign className="text-cyan-600 text-3xl" />
          Latest Posts
        </h1>

        {error && <p className="text-red-500">{error}</p>}

        {!user ? (
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">
              Please <span className="font-semibold text-cyan-700">log in</span>{" "}
              or <span className="font-semibold text-cyan-700">register</span>{" "}
              to see posts.
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
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post, i) => <PostCard key={i} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Home;
