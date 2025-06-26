import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("https://kinnectbackend.onrender.com");

const Chat = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch current user ID from token
  useEffect(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id);
    }
  }, [token]);

  // Fetch users you follow
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(
          `https://kinnectbackend.onrender.com/api/follows/${currentUserId}/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const followed = res.data.following.map((user) => ({
          id: user._id,
          name: user.name || user.username,
        }));

        setAccounts(followed);
      } catch (err) {
        console.error("❌ Error fetching followed users:", err);
      }
    };

    if (currentUserId) {
      socket.emit("join", currentUserId);
      fetchFollowing();
    }

    socket.on("receiveMessage", (data) => {
      if (selectedAccount && data.senderId === selectedAccount.id) {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [currentUserId, selectedAccount]);

  const handleAccountClick = async (account) => {
    setSelectedAccount(account);
    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/messages/${currentUserId}/${account.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChat(res.data);
    } catch (err) {
      console.error("❌ Failed to load chat history", err);
      setChat([]);
    }
  };

  const handleSendMessage = () => {
    if (selectedAccount && message.trim()) {
      const data = {
        senderId: currentUserId,
        receiverId: selectedAccount.id,
        message,
      };
      socket.emit("sendMessage", data);
      setChat((prev) => [...prev, data]);
      setMessage("");
    }
  };

  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* Sidebar: Following list */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h3>Following</h3>
        {accounts.length === 0 ? (
          <p className="text-gray-500 text-sm">You're not following anyone.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {accounts.map((acc) => (
              <li
                key={acc.id}
                onClick={() => handleAccountClick(acc)}
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  backgroundColor:
                    selectedAccount?.id === acc.id ? "#f0f0f0" : "transparent",
                }}
              >
                {acc.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat area */}
      <div
        style={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
        }}
      >
        <h3>
          {selectedAccount
            ? `Chat with ${selectedAccount.name}`
            : "Select someone to chat with"}
        </h3>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          {selectedAccount ? (
            chat.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.senderId === currentUserId ? "right" : "left",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    borderRadius: "15px",
                    backgroundColor:
                      msg.senderId === currentUserId ? "#DCF8C6" : "#FFF",
                    border: "1px solid #ccc",
                  }}
                >
                  {msg.message}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No conversation selected.</p>
          )}
        </div>

        {selectedAccount && (
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "0.5rem" }}
              onKeyPress={(e) =>
                e.key === "Enter" ? handleSendMessage() : null
              }
            />
            <button
              onClick={handleSendMessage}
              style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
