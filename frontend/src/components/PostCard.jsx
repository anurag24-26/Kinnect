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
    <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-200 max-w-2xl mx-auto my-6 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt="User Avatar"
            className="h-12 w-12 rounded-full object-cover border-2 border-cyan-500"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-lg border-2 border-cyan-500">
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="text-lg font-semibold text-cyan-700 hover:underline"
          >
            {post.user.username}
          </Link>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        {/* Post Text */}
        <p className="text-gray-800 text-base">{post.text}</p>

        {/* Images */}
        {post.images?.length > 0 && (
          <div className="rounded-xl overflow-hidden">
            {post.images.length === 1 ? (
              <img
                src={post.images[0]}
                alt="Post"
                className="w-full max-h-[400px] object-cover rounded-xl"
              />
            ) : (
              <Slider {...sliderSettings}>
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="h-[400px] flex justify-center items-center bg-gray-100"
                  >
                    <img
                      src={img}
                      alt={`Post ${idx}`}
                      className="max-h-full max-w-full rounded-xl"
                    />
                  </div>
                ))}
              </Slider>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="flex justify-between items-center mt-6 border-t pt-4 border-gray-100 text-sm">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-xl" />
          ) : (
            <FaRegHeart className="text-xl" />
          )}
          <span>{likeCount}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <FaCommentDots className="text-blue-500 text-xl" />
          <span>{comments.length}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-4 space-y-2">
        {comments.slice(-3).map((comment, i) => (
          <div
            key={i}
            className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
          >
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-cyan-700">
                @{comment.user?.username}:
              </span>{" "}
              {comment.text}
            </p>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-3 mt-4"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm hover:bg-cyan-700 transition"
        >
          {commentLoading ? "Posting..." : "Post"}
        </button>
      </form>

      {/* Error Message */}
      {commentError && (
        <p className="text-red-500 text-sm mt-2">{commentError}</p>
      )}
    </div>
  );
};

export default PostCard;
