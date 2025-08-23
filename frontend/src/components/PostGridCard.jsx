import { Link } from "react-router-dom";

const PostGridCard = ({ post }) => {
  const coverImage =
    post.images && post.images.length > 0
      ? post.images[0]
      : "https://via.placeholder.com/300x300.png?text=No+Image";

  return (
    <Link
      to={`/post/${post._id}`}
      className="relative group block w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg"
    >
      <img
        src={coverImage}
        alt="Post"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      {post.text && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center text-sm text-white transition">
          {post.text.length > 60 ? post.text.slice(0, 60) + "..." : post.text}
        </div>
      )}
    </Link>
  );
};

export default PostGridCard;
