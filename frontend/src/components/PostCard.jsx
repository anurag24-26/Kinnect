import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // --- API Calls ---
  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
    } catch {}
  };

  const fetchLikeCount = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikeCount(res.data.count);
    } catch {}
  };

  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikeCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
    } catch {}
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/comments/${post._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } catch {}
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      setCommentLoading(true);
      await axios.post(
        `https://kinnectbackend.onrender.com/api/comments`,
        { postId: post._id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      fetchComments();
      setShowComments(true);
    } catch {
      console.error("❌ Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLikeStatus();
      fetchLikeCount();
      fetchComments();
    }
  }, [post._id]);

  return (
    <div className="bg-[#1E1E2E] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-white/10">
      {/* User Info */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        {post.user?.avatar ? (
          <img
            src={post.user.avatar}
            alt="avatar"
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="w-12 h-12 rounded-full object-cover cursor-pointer"
          />
        ) : (
          <div
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold cursor-pointer"
          >
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <p
            onClick={() => navigate(`/profile/${post.user._id}`)}
            className="font-semibold text-white cursor-pointer hover:underline"
          >
            {post.user.username}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Image */}
      {post.images?.length > 0 && (
        <img
          src={post.images[0]}
          alt="Post"
          className="w-full h-64 object-cover"
        />
      )}

      {/* Post Content */}
      {post.text && (
        <p className="px-4 py-3 text-sm text-gray-200 whitespace-pre-line">
          {post.text}
        </p>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reaction Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 text-gray-200 hover:scale-110 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-xl" />
          )}
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-2 text-gray-200 hover:scale-110 transition"
        >
          <FaCommentDots className="text-blue-400" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 space-y-2 bg-black/30 border-t border-white/10">
          {comments.length > 0 ? (
            comments.map((c, i) => (
              <p key={i} className="text-sm text-gray-300">
                <span className="font-semibold text-pink-400">
                  @{c.user?.username}
                </span>{" "}
                {c.text}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No comments yet</p>
          )}
        </div>
      )}

      {/* Comment Input */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 p-3 border-t border-white/10"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 rounded-full bg-[#2A2A3B] text-white text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white text-sm disabled:opacity-50"
        >
          {commentLoading ? "..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostCard;
