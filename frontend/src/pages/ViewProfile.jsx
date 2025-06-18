import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewProfile = () => {
  const { id } = useParams(); // user ID from URL
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch user:",
        err.response?.data || err.message
      );
    }
  };

  const checkFollowing = async () => {
    try {
      const res = await axios.get(`/api/follows/${id}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const myId = JSON.parse(atob(token.split(".")[1])).id;
      setIsFollowing(res.data.followers?.includes(myId));
    } catch (err) {
      console.error(
        "❌ Failed to check following:",
        err.response?.data || err.message
      );
    }
  };

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      await axios.post(
        `/api/follows/${isFollowing ? "unfollow" : "follow"}`,
        { targetUserId: id }, // important
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(
        "❌ Failed to toggle follow:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    checkFollowing();
  }, [id]);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">{user.username}</h2>
      <p className="text-sm text-gray-600">{user.email}</p>

      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded ${
          isFollowing ? "bg-red-500" : "bg-cyan-600"
        } text-white`}
      >
        {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

export default ViewProfile;
