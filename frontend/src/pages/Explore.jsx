import { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaUserPlus } from "react-icons/fa";

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with logged-in user ID (maybe from context/auth)
  const loggedInUserId = "USER_ID_HERE";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch trending posts
        const postsRes = await axios.get(
          "https://kinnectbackend.onrender.com/api/posts/trending"
        );

        // Fetch suggested users
        const usersRes = await axios.get(
          `https://kinnectbackend.onrender.com/api/users/suggested/${loggedInUserId}`
        );

        setTrendingPosts(postsRes.data || []);
        setSuggestedUsers(usersRes.data || []);
      } catch (err) {
        setError("Failed to load explore content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId]);

  if (loading) return <p className="text-center py-6">Loading Explore...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Trending Posts */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">🔥 Trending Posts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {trendingPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white shadow-md rounded-xl p-4 border"
            >
              <h3 className="font-semibold">{post.user?.username}</h3>
              <p className="text-gray-700 mt-2">{post.caption}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="rounded-lg mt-3 w-full"
                />
              )}
              <div className="flex items-center gap-2 mt-3 text-gray-600">
                <FaHeart className="text-red-500" /> {post.likes?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Users */}
      <section>
        <h2 className="text-xl font-bold mb-4">✨ Suggested Users</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {suggestedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between border"
            >
              <div>
                <h3 className="font-semibold">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition">
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
