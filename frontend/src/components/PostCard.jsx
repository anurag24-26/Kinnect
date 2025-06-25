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

  const token = localStorage.getItem("token");

  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLiked(res.data.liked);
    } catch (err) {
      console.error("❌ Failed to fetch like status", err);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLikeCount(res.data.count);
    } catch (err) {
      console.error("❌ Failed to fetch like count", err);
    }
  };

  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `https://kinnectbackend.onrender.com/api/likes/${post._id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLiked(res.data.liked);
      setLikeCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("❌ Failed to toggle like", err);
    }
  };
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/comments/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch comments", err);
    }
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
      fetchComments(); // refresh comments
    } catch (err) {
      setCommentError("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      fetchLikeStatus();
      fetchLikeCount();
      fetchComments(); // Fetch comments on initial load
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
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 max-w-xl w-full mx-auto mb-6 transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover border-2 border-cyan-500"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-base border-2 border-cyan-500">
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="text-sm font-semibold text-cyan-700 hover:underline"
          >
            {post.user.username}
          </Link>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Text */}
      {post.text && (
        <p className="text-gray-800 text-sm mb-3 break-words">{post.text}</p>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div className="rounded-md overflow-hidden mb-3">
          {post.images.length === 1 ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={post.images[0]}
                alt="Post"
                className="object-contain max-h-full max-w-full"
              />
            </div>
          ) : (
            <Slider {...sliderSettings}>
              {post.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-video flex justify-center items-center content-center bg-black"
                >
                  <img
                    src={img}
                    alt={`Post ${idx}`}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ))}
            </Slider>
          )}
        </div>
      )}

      {/* Tags */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full break-words"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Like + Comment Summary */}
      <div className="flex justify-between items-center text-sm mt-2 border-t pt-3 border-gray-100">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-lg" />
          )}
          <span>{likeCount}</span>
        </button>

        <div className="flex items-center gap-1 text-gray-600">
          <FaCommentDots className="text-blue-500 text-lg" />
          <span>{comments.length}</span>
        </div>
      </div>

      {/* Mini Comments */}
      <div className="mt-3 space-y-1">
        {comments.slice(-2).map((comment, i) => (
          <p
            key={i}
            className="text-xs text-gray-700 border-l-2 pl-2 border-cyan-400"
          >
            <span className="font-semibold">@{comment.user?.username}</span>:{" "}
            {comment.text.length > 60
              ? `${comment.text.slice(0, 60)}...`
              : comment.text}
          </p>
        ))}
      </div>

      {/* Comment Input */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 mt-3"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Comment..."
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="bg-cyan-600 text-white px-3 py-1.5 text-xs rounded-full hover:bg-cyan-700 transition"
        >
          {commentLoading ? "..." : "Post"}
        </button>
      </form>

      {commentError && (
        <p className="text-red-500 text-xs mt-1">{commentError}</p>
      )}
    </div>
  );
};

export default PostCard;
