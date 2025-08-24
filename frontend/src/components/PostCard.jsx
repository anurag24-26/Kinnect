import { useEffect, useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostCard.css"; // your CSS for grid + animations

const PostCard = ({ post, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // 🔥 assume you store this after login
  const navigate = useNavigate();

  // --- Fetch Like/Comments ---
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

  // --- Delete Post ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(
        `https://kinnectbackend.onrender.com/api/posts/${post._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onDelete) onDelete(post._id); // parent removes post from UI
    } catch (err) {
      console.error("❌ Failed to delete post", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLikeStatus();
      fetchLikeCount();
      fetchComments();
    }
  }, [post._id]);

  // Image Carousel
  const nextImage = () => {
    if (!post.images?.length) return;
    setActiveIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    if (!post.images?.length) return;
    setActiveIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="post-card relative">
      {/* === Dropdown Menu (only owner) === */}
      {userId === post.user._id && (
        <div className="absolute top-2 right-2">
          <button
            className="text-gray-200 hover:text-white"
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <BsThreeDots size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 bg-[#1E1E2E] border border-white/10 text-sm text-gray-200 rounded-md shadow-lg z-20">
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white rounded-t-md"
              >
                🗑 Delete Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Image Section */}
      {post.images?.length > 0 && (
        <div className="post-image-container">
          <img
            src={post.images[activeIndex]}
            alt={`Post-${activeIndex}`}
            className="post-image fadeIn"
          />
          {post.images.length > 1 && (
            <>
              <button className="carousel-btn left" onClick={prevImage}>
                <FaChevronLeft />
              </button>
              <button className="carousel-btn right" onClick={nextImage}>
                <FaChevronRight />
              </button>
              <div className="carousel-dots">
                {post.images.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === activeIndex ? "active" : ""}`}
                  ></span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="post-content">
        {/* User Info */}
        <div
          className="post-user"
          onClick={() => navigate(`/profile/${post.user._id}`)}
        >
          <img
            src={post.user.avatar || "/default-avatar.png"}
            className="user-avatar"
            alt="avatar"
          />
          <div>
            <p className="username">{post.user.username}</p>
            <span className="timestamp">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Text */}
        {post.text && <p className="post-text">{post.text}</p>}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map((tag, i) => (
              <span key={i} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="actions">
          <button
            onClick={toggleLike}
            className={`like-btn ${liked ? "liked pulse" : ""}`}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
            <span>{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} className="comment-btn">
            <FaCommentDots />
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {/* 🔹 Comments Modal */}
      {showComments && (
        <div className="comments-modal">
          <div className="comments-content">
            <button
              className="close-btn"
              onClick={() => setShowComments(false)}
            >
              ✖
            </button>
            <h3>Comments</h3>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <p key={i} className="comment">
                    <span className="comment-user">@{c.user?.username}</span>{" "}
                    {c.text}
                  </p>
                ))
              ) : (
                <p className="no-comments">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write comment..."
              />
              <button type="submit" disabled={commentLoading}>
                {commentLoading ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
