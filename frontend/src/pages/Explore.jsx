import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaUserPlus } from "react-icons/fa";

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user ID from localStorage (set during login/register)
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Trending posts
        const postsRes = await axios.get(
          "https://kinnectbackend.onrender.com/api/posts/trending"
        );

        // Suggested users
        if (loggedInUserId) {
          const usersRes = await axios.get(
            `https://kinnectbackend.onrender.com/api/users/suggested/${loggedInUserId}`
          );
          setSuggestedUsers(usersRes.data || []);
        }

        setTrendingPosts(postsRes.data || []);
      } catch (err) {
        setError("⚠️ Failed to load explore content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId]);

  if (loading) return <p className="text-center py-6 text-[#94A1B2]">Loading Explore...</p>;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-[#FFFFFE]">
      {/* Trending Posts */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D]">
          🔥 Trending Posts
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {trendingPosts.map((post) => (
            <div
              key={post._id}
              className="bg-[#1F1F24] rounded-2xl p-5 border border-[#2CB67D]/20 shadow-lg hover:shadow-2xl transition-all"
            >
              <h3 className="font-semibold text-[#FFFFFE]">{post.user?.username}</h3>
              <p className="text-[#94A1B2] mt-2">{post.text}</p>

              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[0]}
                  alt="Post"
                  className="rounded-xl mt-4 w-full object-cover"
                />
              )}

              <div className="flex items-center gap-2 mt-4 text-[#94A1B2]">
                <FaHeart className="text-red-500" /> {post.likes?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Users */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#7F5AF0] to-[#FF8906]">
          ✨ Suggested Users
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {suggestedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-[#1F1F24] rounded-2xl p-5 flex items-center justify-between border border-[#7F5AF0]/20 shadow-md hover:shadow-xl transition-all"
            >
              <div>
                <h3 className="font-semibold text-[#FFFFFE]">{user.username}</h3>
                <p className="text-sm text-[#94A1B2]">{user.email}</p>
              </div>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transition">
                <FaUserPlus /> Follow
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;
