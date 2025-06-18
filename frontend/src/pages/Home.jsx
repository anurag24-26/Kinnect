import { useEffect, useState } from "react";
import { MdCampaign } from "react-icons/md";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await axios.get("/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("✅ Response from /api/posts:", res.data); // <-- Add this
      setPosts(res.data);
    } catch (err) {
      setError("Failed to load posts");
      console.error("❌ Post fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 border-b pb-2 border-gray-200">
          <MdCampaign className="text-cyan-600 text-3xl" />
          Latest Posts
        </h1>

        {error && <p className="text-red-500">{error}</p>}

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post, i) => <PostCard key={i} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Home;
