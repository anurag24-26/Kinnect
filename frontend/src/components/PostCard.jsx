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
    <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-200 max-w-2xl w-full mx-auto mb-8 transition-all hover:shadow-lg">
  {/* Header */}
  <div className="flex items-center gap-4 mb-4">
    {post.user.avatar ? (
      <img
        src={post.user.avatar}
        alt="User Avatar"
        className="h-12 w-12 rounded-full object-cover border-2 border-cyan-600"
      />
    ) : (
      <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-base border-2 border-cyan-600">
        {post.user.username[0].toUpperCase()}
      </div>
    )}
    <div>
      <Link
        to={`/profile/${post.user._id}`}
        className="text-sm font-semibold text-gray-800 hover:underline"
      >
        {post.user.username}
      </Link>
      <p className="text-xs text-gray-400 mt-0.5">
        {new Date(post.createdAt).toLocaleString()}
      </p>
    </div>
  </div>

  {/* Post Text */}
  {post.text && (
    <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
      {post.text}
    </p>
  )}

  {/* Images */}
  {post.images?.length > 0 && (
    <div className="rounded-lg overflow-hidden mb-4">
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
              className="aspect-video flex justify-center items-center bg-black"
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
    <div className="flex flex-wrap gap-2 mb-3">
      {post.tags.map((tag, i) => (
        <span
          key={i}
          className="text-xs bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-medium"
        >
          #{tag}
        </span>
      ))}
    </div>
  )}

  {/* Reactions */}
  <div className="flex justify-between items-center text-sm mt-4 pt-3 border-t border-gray-100">
    <button
      onClick={toggleLike}
      className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
    >
      {liked ? (
        <FaHeart className="text-red-500 text-lg" />
      ) : (
        <FaRegHeart className="text-lg" />
      )}
      <span>{likeCount}</span>
    </button>

    <div className="flex items-center gap-2 text-gray-600">
      <FaCommentDots className="text-blue-500 text-lg" />
      <span>{comments.length}</span>
    </div>
  </div>

  {/* Recent Comments */}
  <div className="mt-4 space-y-2">
    {comments.slice(-2).map((comment, i) => (
      <div
        key={i}
        className="text-xs text-gray-700 border-l-2 pl-3 border-cyan-400"
      >
        <span className="font-semibold">@{comment.user?.username}</span>:{" "}
        {comment.text.length > 60
          ? `${comment.text.slice(0, 60)}...`
          : comment.text}
      </div>
    ))}
  </div>

  {/* Comment Form */}
  <form
    onSubmit={handleCommentSubmit}
    className="flex items-center gap-2 mt-4"
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
      className="bg-cyan-600 text-white px-4 py-2 text-sm rounded-full hover:bg-cyan-700 transition disabled:opacity-50"
    >
      {commentLoading ? "..." : "Post"}
    </button>
  </form>

  {commentError && (
    <p className="text-red-500 text-xs mt-2">{commentError}</p>
  )}
</div>

  );
};

export default PostCard;
