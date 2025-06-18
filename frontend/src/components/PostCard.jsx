import { useState } from "react";
import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: post.images.length > 1, // only show arrows if multiple images
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

      {/* Post Text */}
      <p className="text-sm text-gray-800 mb-3">{post.text}</p>

      {/* Post Image(s) */}
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

      {/* Actions */}
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

        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition text-xl">
          <FaCommentDots className="text-2xl" />
          <span className="text-lg">{post.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
