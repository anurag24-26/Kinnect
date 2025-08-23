import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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

  // --- Navigation logic ---
  const handlePostClick = () => {
    navigate(`/profile/${post.user._id}/post/${post._id}`);
  };

  return (
    <div
      onClick={handlePostClick}
      className="cursor-pointer bg-gradient-to-br from-purple-800/90 via-indigo-900/80 to-black/90 rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all hover:shadow-aurora hover:scale-[1.02] duration-500 max-w-3xl mx-auto mb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-6 p-6 border-b border-white/20">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt="User Avatar"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.user._id}`);
            }}
            className="h-16 w-16 rounded-full object-cover ring-4 ring-transparent bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[2px] cursor-pointer"
          />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.user._id}`);
            }}
            className="h-16 w-16 rounded-full flex items-center justify-center text-2xl text-white font-bold bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 cursor-pointer"
          >
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.user._id}`);
            }}
            className="font-bold text-lg text-white hover:underline cursor-pointer"
          >
            {post.user.username}
          </span>
          <span className="text-sm text-gray-300">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      {post.text && (
        <p className="px-6 py-6 text-lg text-gray-100 leading-relaxed whitespace-pre-line">
          {post.text}
        </p>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="rounded-xl overflow-hidden">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post"
              className="object-cover w-full max-h-[600px]"
            />
          ) : (
            <Slider {...sliderSettings}>
              {post.images.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`Post ${idx}`}
                    className="object-cover w-full max-h-[600px]"
                  />
                </div>
              ))}
            </Slider>
          )}
        </div>
      )}

      {/* Tags */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-3 px-6 py-4 border-t border-white/20">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reaction Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex justify-between items-center px-6 py-4 border-t border-white/20"
      >
        <button
          onClick={toggleLike}
          className="flex items-center gap-3 text-gray-200 hover:scale-125 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-2xl" />
          ) : (
            <FaRegHeart className="text-2xl" />
          )}
          <span className="text-lg">{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-3 text-gray-200 hover:scale-110 transition"
        >
          <FaCommentDots className="text-blue-400 text-2xl" />
          <span className="text-lg">{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-5 bg-black/40 backdrop-blur-md space-y-4 animate-fadeIn">
          {comments.length > 0 ? (
            comments.map((comment, i) => (
              <div
                key={i}
                className="text-sm text-gray-200 border-l-4 pl-4 border-indigo-400/60"
              >
                <span className="font-semibold text-pink-400">
                  @{comment.user?.username}
                </span>
                : {comment.text}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No comments yet</p>
          )}
        </div>
      )}

      {/* Comment Form */}
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-3 p-6 border-t border-white/20"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-5 py-3 text-base rounded-full border border-gray-500 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 text-base rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {commentLoading ? "..." : "Post"}
        </button>
      </form>

      {commentError && (
        <p className="text-red-400 text-sm px-6 pb-5">{commentError}</p>
      )}
    </div>
  );
};

export default PostCard;
