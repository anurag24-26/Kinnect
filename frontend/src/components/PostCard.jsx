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
      const res = await axios.get(`/api/likes/${post._id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiked(res.data.liked);
    } catch (err) {
      console.error("❌ Failed to fetch like status", err);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const res = await axios.get(`/api/likes/${post._id}/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeCount(res.data.count);
    } catch (err) {
      console.error("❌ Failed to fetch like count", err);
    }
  };

  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `/api/likes/${post._id}/toggle`,
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
      const res = await axios.get(`/api/comments/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        `/api/comments`,
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
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 max-w-xl mx-auto my-6 transition hover:shadow-lg">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            className="h-12 w-12 rounded-full object-cover border-2 border-cyan-500"
            alt="User Avatar"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-lg border-2 border-cyan-500">
            {post.user.username[0].toUpperCase()}
          </div>
        )}
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="text-md font-semibold text-cyan-700 hover:underline"
          >
            {post.user.username}
          </Link>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Post Images */}
      {post.images?.length > 0 && (
        <div className="mb-3 rounded-xl overflow-hidden">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post"
              className="rounded-xl w-full object-contain max-h-[400px] mx-auto bg-black"
            />
          ) : (
            <Slider {...sliderSettings}>
              {post.images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex justify-center items-center h-[400px] bg-black"
                >
                  <img
                    src={img}
                    alt={`Post ${idx + 1}`}
                    className="object-contain max-h-full max-w-full mx-auto"
                  />
                </div>
              ))}
            </Slider>
          )}
        </div>
      )}

      {/* Text Content */}
      <p className="text-sm text-gray-800 mb-3">{post.text}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Like & Comment Counts */}
      <div className="flex justify-start items-center gap-8 mt-5 pt-3 border-t border-gray-100 text-sm">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
        >
          {liked ? (
            <FaHeart className="text-red-500 text-2xl" />
          ) : (
            <FaRegHeart className="text-2xl" />
          )}
          <span className="text-lg">{likeCount}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600 text-xl">
          <FaCommentDots className="text-blue-500 text-2xl" />
          <span className="text-lg">{comments.length}</span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {comments.slice(-3).map((comment, index) => (
          <p
            key={index}
            className="text-sm text-gray-700 border-l-2 pl-2 border-cyan-400"
          >
            <span className="font-semibold">@{comment.user?.username}:</span>{" "}
            {comment.text}
          </p>
        ))}
      </div>

      {/* Comment Input */}
      <form
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2 mt-4"
      >
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={commentLoading}
          className="bg-cyan-600 text-white px-4 py-1 rounded hover:bg-cyan-700"
        >
          {commentLoading ? "Posting..." : "Post"}
        </button>
      </form>
      {commentError && <p className="text-red-500 mt-2">{commentError}</p>}
    </div>
  );
};

export default PostCard;
