import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";

const ViewProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likesStatus, setLikesStatus] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message || "User not found or failed to fetch user."
      );
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`/api/posts/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load posts", err);
    }
  };

  const checkFollowing = async () => {
    try {
      const res = await axios.get(`/api/follows/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const myId = JSON.parse(atob(token.split(".")[1])).id;
      const isUserFollowing = res.data.followers.some((f) => f._id === myId);

      setIsFollowing(isUserFollowing);
      setFollowersCount(res.data.followers.length);
      setFollowingCount(res.data.following.length);
    } catch (err) {
      console.error("❌ checkFollowing error:", err);
    }
  };

  const fetchLikesStatusAndCount = async () => {
    try {
      const likeStatusObj = {};
      const likeCountObj = {};

      await Promise.all(
        posts.map(async (post) => {
          const [statusRes, countRes] = await Promise.all([
            axios.get(`/api/likes/${post._id}/status`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`/api/likes/${post._id}/count`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          likeStatusObj[post._id] = statusRes.data.liked;
          likeCountObj[post._id] = countRes.data.count;
        })
      );

      setLikesStatus(likeStatusObj);
      setLikesCount(likeCountObj);
    } catch (err) {
      console.error("❌ Failed to fetch like data", err);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await axios.post(
        `/api/likes/${postId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikesStatus((prev) => ({
        ...prev,
        [postId]: res.data.liked,
      }));

      setLikesCount((prev) => ({
        ...prev,
        [postId]: res.data.liked ? prev[postId] + 1 : prev[postId] - 1,
      }));
    } catch (err) {
      console.error("❌ Like toggle error", err);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      await axios.post(
        `/api/follows/${id}/${isFollowing ? "unfollow" : "follow"}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => prev + (isFollowing ? -1 : 1));
    } catch (err) {
      alert("Failed to update follow status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return setError("Unauthorized. Please log in.");
    fetchUser();
    fetchUserPosts();
    checkFollowing();
  }, [id]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchLikesStatusAndCount();
    }
  }, [posts]);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>

      {error && (
        <p className="text-red-600 bg-red-100 border border-red-300 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {!user && !error && token && (
        <p className="text-center text-gray-500">⏳ Loading user profile...</p>
      )}

      {user && (
        <div className="bg-white p-6 rounded shadow text-center mb-8">
          <h2 className="text-2xl font-semibold text-cyan-700 mb-2">
            @{user.username}
          </h2>

          <div className="flex justify-center gap-6 mt-4 mb-6">
            <div>
              <p className="text-lg font-bold">{followersCount}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">{followingCount}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>

          {user._id !== JSON.parse(atob(token.split(".")[1])).id && (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`mt-2 px-5 py-2 rounded-full text-white transition-all duration-200 ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-gray-200 p-4 rounded-xl shadow-md"
            >
              {post.images?.length > 0 && (
                <img
                  src={post.images[0]}
                  alt="post"
                  className="w-full max-h-96 object-contain mb-4 rounded-lg bg-black"
                />
              )}
              <p className="text-gray-800 text-sm mb-2">{post.text}</p>

              <div className="flex gap-6 text-gray-600 text-sm mt-3 border-t pt-3">
                <button
                  onClick={() => handleLikeToggle(post._id)}
                  className="flex items-center gap-2"
                >
                  {likesStatus[post._id] ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                  {likesCount[post._id] || 0}
                </button>

                <span className="flex items-center gap-2">
                  <FaCommentDots className="text-blue-500" />
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        user && (
          <p className="text-center text-gray-500 mt-6">
            This user hasn't posted anything yet.
          </p>
        )
      )}
    </div>
  );
};

export default ViewProfile;
