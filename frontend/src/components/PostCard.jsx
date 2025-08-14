import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import axios from "axios";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);

  const token = localStorage.getItem("token");

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
      setCommentError("Failed to post comment");
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

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: post.images?.length > 1,
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01] duration-300 max-w-2xl mx-auto mb-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-white/20">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt="User Avatar"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent bg-gradient-to-tr from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] p-[2px]"
          />
        ) : (
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-tr from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]">
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <Link
            to={`/profile/${post.user._id}`}
            className="font-semibold text-gray-800 hover:underline text-sm"
          >
            {post.user.username}
          </Link>
          <span className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      {post.text && (
        <p className="px-5 py-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {post.text}
        </p>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="rounded-lg overflow-hidden">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post"
              className="object-cover w-full max-h-[450px]"
            />
          ) : (
            <Slider {...sliderSettings}>
              {post.images.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`Post ${idx}`}
                    className="object-cover w-full max-h-[450px]"
                  />
                </div>
              ))}
            </Slider>
          )}
        </div>
      )}

      {/* Tags */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-white/20">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] text-white shadow-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reaction Bar */}
      <div className="flex justify-between items-center px-5 py-3 border-t border-white/20">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 text-gray-700 hover:scale-110 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-lg" />
          )}
          <span className="text-sm">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-2 text-gray-700 hover:scale-105 transition"
        >
          <FaCommentDots className="text-blue-500 text-lg" />
          <span className="text-sm">{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 py-4 bg-white/50 backdrop-blur-sm space-y-3 animate-fadeIn">
          {comments.length > 0 ? (
            comments.map((comment, i) => (
              <div
                key={i}
                className="text-xs text-gray-800 border-l-4 pl-3 border-[#3B82F6]/50"
              >
                <span className="font-semibold">@{comment.user?.username}</span>:{" "}
                {comment.text}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">No comments yet</p>
          )}
        </div>
      )}

      {/* Comment Form */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 p-5 border-t border-white/20"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] text-white px-4 py-2 text-sm rounded-full shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {commentLoading ? "..." : "Post"}
        </button>
      </form>

      {commentError && (
        <p className="text-red-500 text-xs px-5 pb-4">{commentError}</p>
      )}
    </div>
  );
};

export default PostCard;
