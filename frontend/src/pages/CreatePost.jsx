import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = [...images, ...selectedFiles].slice(0, 3);

    // Clean old previews
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setImages(totalFiles);
    const previewUrls = totalFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("text", text);
      formData.append("tags", tags);
      images.forEach((img) => formData.append("images", img));

      const res = await axios.post(
        "https://kinnectbackend.onrender.com/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Post created:", res.data);
      navigate("/");
    } catch (err) {
      console.error(
        "❌ Failed to create post:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden">
      {/* Aurora background effect */}
      <div className="absolute inset-0">
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-xl text-white"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          ✨ Create New Post
        </h2>

        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-3 bg-white/10 border border-white/30 rounded-lg mb-4 placeholder-gray-300 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-3 bg-white/10 border border-white/30 rounded-lg mb-4 placeholder-gray-300 text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mb-2 text-gray-200"
        />
        <p className="text-sm text-gray-300 mb-4">You can upload up to 3 images.</p>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {imagePreviews.map((src, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-white/30 shadow-lg"
              >
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-full object-cover transform hover:scale-105 transition duration-300"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform transition duration-300 hover:scale-105"
        >
          {loading ? "✨ Posting..." : "🚀 Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
