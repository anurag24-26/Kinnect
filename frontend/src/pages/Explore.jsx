import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard"; // make sure path is correct
import { FaUserPlus } from "react-icons/fa";

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch trending posts
        const postsRes = await axios.get(
          "https://kinnectbackend.onrender.com/api/posts/trending",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTrendingPosts(postsRes.data || []);

        // 2. Fetch suggested users
        if (loggedInUserId) {
          const usersRes = await axios.get(
            `https://kinnectbackend.onrender.com/api/users/suggested/${loggedInUserId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuggestedUsers(usersRes.data || []);
        }
      } catch (err) {
        console.error("⚠️ Explore fetch error:", err.response?.data || err.message);
        setError("⚠️ Failed to load explore content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId, token]);

  if (loading)
    return <p className="text-center py-6 text-[#94A1B2]">Loading Explore...</p>;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-[#FFFFFE]">
      {/* Trending Posts */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D]">
          🔥 Trending Posts
        </h2>
        {trendingPosts.length > 0 ? (
          <div className="flex flex-col gap-10">
            {trendingPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-[#94A1B2]">No trending posts found.</p>
        )}
      </section>

      {/* Suggested Users */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#FF8906]">
          ✨ Suggested Users
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div
                key={user._id}
                className="bg-[#1F1F24] rounded-2xl p-5 flex items-center justify-between border border-[#7F5AF0]/20 shadow-md hover:shadow-xl transition-all"
              >
                <div>
                  <h3 className="font-semibold text-[#FFFFFE]">
                    {user.username}
                  </h3>
                  <p className="text-sm text-[#94A1B2]">{user.email}</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transition">
                  <FaUserPlus /> Follow
                </button>
              </div>
            ))
          ) : (
            <p className="text-[#94A1B2]">No suggested users right now.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;
