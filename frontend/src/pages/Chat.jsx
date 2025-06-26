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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        height: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#f0f2f5",
      }}
    >
      <style>
        {`
          @media (max-width: 768px) {
            .sidebar {
              width: 100% !important;
              border-right: none !important;
              border-bottom: 1px solid #ccc;
            }
            .chat-section {
              width: 100% !important;
            }
          }
        `}
      </style>

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          width: "30%",
          background: "linear-gradient(to bottom, #e0f7fa, #ffffff)",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
          transition: "0.3s ease",
        }}
      >
        <h3 style={{ color: "#006064", marginBottom: "1rem" }}>🧑‍🤝‍🧑 Following</h3>
        {accounts.length === 0 ? (
          <p style={{ color: "#777", fontSize: "0.9rem" }}>
            You're not following anyone yet.
          </p>
        ) : (
          <ul style={{ padding: 0, listStyleType: "none" }}>
            {accounts.map((acc) => (
              <li
                key={acc.id}
                onClick={() => handleAccountClick(acc)}
                style={{
                  padding: "0.6rem 0.9rem",
                  marginBottom: "0.6rem",
                  borderRadius: "10px",
                  backgroundColor:
                    selectedAccount?.id === acc.id ? "#b2ebf2" : "#ffffff",
                  color: "#004d40",
                  cursor: "pointer",
                  border:
                    selectedAccount?.id === acc.id
                      ? "2px solid #00acc1"
                      : "1px solid #e0e0e0",
                  transition: "background-color 0.2s ease",
                }}
              >
                {acc.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Section */}
      <div
        className="chat-section"
        style={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "2px solid #00acc1",
            color: "#00796b",
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          {selectedAccount
            ? `Chat with ${selectedAccount.name}`
            : "💬 Choose someone to start chatting"}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
          }}
        >
          {selectedAccount ? (
            chat.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === currentUserId ? "flex-end" : "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "0.8rem 1rem",
                    maxWidth: "75%",
                    backgroundColor:
                      msg.senderId === currentUserId ? "#c8e6c9" : "#ffffff",
                    border: "1px solid #ccc",
                    borderRadius: "16px",
                    fontSize: "0.95rem",
                    color: "#333",
                    boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#777" }}>No messages yet</p>
          )}
        </div>

        {selectedAccount && (
          <div style={{ display: "flex", marginTop: "1rem" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "20px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
                outline: "none",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              style={{
                marginLeft: "0.75rem",
                padding: "0.6rem 1.2rem",
                backgroundColor: "#00796b",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
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
