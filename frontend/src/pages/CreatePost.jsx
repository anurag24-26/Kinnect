import { useState, useEffect } from "react";
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
        "http://localhost:5000/api/posts",
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
    <div className="min-h-screen bg-gray-100 px-4 flex justify-center items-start pt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-4 text-cyan-600">
          Create New Post
        </h2>

        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md mb-4"
          required
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mb-2"
        />
        <p className="text-sm text-gray-500 mb-4">
          You can upload up to 3 images.
        </p>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {imagePreviews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index + 1}`}
                className="h-24 w-full object-cover rounded-md border"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md font-medium transition"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
