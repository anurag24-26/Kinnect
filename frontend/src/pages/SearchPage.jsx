import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaUser, FaFileAlt } from "react-icons/fa"; // ✅ Import all needed icons

const SearchPage = () => {
  const { query } = useParams();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`/api/search/${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <FaSearch className="text-xl text-cyan-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Search results for "<span className="text-cyan-600">{query}</span>"
        </h2>
      </div>

      {loading && <p className="text-gray-600">🔄 Loading...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Users Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FaUser className="text-cyan-500" />
          <h3 className="text-lg font-semibold text-gray-700">Users</h3>
        </div>

        {users.length > 0 ? (
          <ul className="space-y-3">
            {users.map((user) => (
              <li key={user._id}>
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-2 text-cyan-700 hover:underline"
                >
                  <FaUser className="text-gray-400" />
                  <span className="text-md font-medium">{user.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>

      {/* Posts Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FaFileAlt className="text-cyan-500" />
          <h3 className="text-lg font-semibold text-gray-700">Posts</h3>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FaUser className="text-cyan-500" />
                  <span>@{post.user.username}</span>
                </div>
                <p className="text-gray-800">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
