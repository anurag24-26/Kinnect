import { useState } from "react";

// Modal component (basic)
function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1E1E2E] rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >✕</button>
        {children}
      </div>
    </div>
  );
}

const PostGridCard = ({ post, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Assume logged-in user id is stored in localStorage at login
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const coverImage =
    post.images && post.images.length > 0
      ? post.images[0]
      : "https://via.placeholder.com/300x300.png?text=No+Image";

  // Delete function (calls API and parent callback)
  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await fetch(
        `https://kinnectbackend.onrender.com/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setModalOpen(false); // close modal
      if (onDelete) onDelete(post._id); // tell parent to remove post from feed
    } catch (err) {
      alert("Could not delete post");
    }
  };

  return (
    <>
      {/* Card */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="relative group block w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg cursor-pointer"
        style={{ textDecoration: "none" }}
      >
        <img
          src={coverImage}
          alt="Post"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {post.text && (
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 text-center text-sm text-white transition"
            style={{ pointerEvents: "none" }}
          >
            <span style={{ pointerEvents: "auto" }}>
              {post.text.length > 60 ? post.text.slice(0, 60) + "..." : post.text}
            </span>
          </div>
        )}
      </button>

      {/* Modal */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <img
          src={coverImage}
          alt="Post"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <h2 className="text-lg text-white font-bold mb-2">
          {post.text?.length > 0 ? post.text : "No description"}
        </h2>
        {post.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag, i) => (
              <span key={i} className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-400">
            Posted on {new Date(post.createdAt).toLocaleDateString()}
          </div>
          {/* Show delete button if it's self user */}
          {userId === post.user._id && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
            >
              Delete
            </button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PostGridCard;
