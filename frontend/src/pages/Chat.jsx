import { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaCircle } from "react-icons/fa";

const socket = io("https://kinnectbackend.onrender.com");

const Chat = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id);
    }
  }, [token]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(
          `https://kinnectbackend.onrender.com/api/follows/${currentUserId}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
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

      socket.on("receiveMessage", (data) => {
        if (
          selectedAccount &&
          (data.senderId === selectedAccount.id ||
            data.receiverId === selectedAccount.id)
        ) {
          setChat((prev) => [...prev, data]);
        } else if (data.receiverId === currentUserId) {
          setUnreadMessages((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }
      });

      socket.on("typing", ({ senderId }) => {
        setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
        setTimeout(() => {
          setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
        }, 2000);
      });

      socket.on("onlineUsers", (userList) => {
        setOnlineUsers(userList);
      });
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("onlineUsers");
    };
  }, [currentUserId, selectedAccount]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const handleAccountClick = async (account) => {
    setSelectedAccount(account);
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[account.id];
      return updated;
    });
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
      setMessage("");
    }
  };

  const handleTyping = () => {
    if (selectedAccount) {
      socket.emit("typing", {
        senderId: currentUserId,
        receiverId: selectedAccount.id,
      });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(
      (user) => user === userId || user?.id === userId || user?._id === userId
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-cyan-100 to-white font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-300 p-4 overflow-y-auto bg-white shadow-md">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Chats</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500">
            Follow someone to start chatting.
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                onClick={() => handleAccountClick(acc)}
                className={`flex items-center justify-between px-4 py-2 rounded-md border cursor-pointer transition-all duration-200 ${
                  selectedAccount?.id === acc.id
                    ? "bg-cyan-100 border-cyan-500"
                    : "bg-white border-gray-200 hover:bg-cyan-50"
                }`}
              >
                <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  {acc.name}
                  {unreadMessages[acc.id] && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadMessages[acc.id]}
                    </span>
                  )}
                </span>
                <FaCircle
                  className={`text-xs ${
                    isUserOnline(acc.id) ? "text-green-500" : "text-gray-400"
                  }`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-2/3 flex flex-col bg-white relative">
        <div className="p-4 border-b">
          <h4 className="text-lg font-semibold text-gray-700">
            {selectedAccount
              ? `Chat with ${selectedAccount.name}`
              : "Select a user to start chatting"}
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-100 space-y-3">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-[75%] text-sm border shadow-sm ${
                  msg.senderId === currentUserId
                    ? "bg-green-100 border-green-300 rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                    : "bg-white border-gray-300 rounded-tr-xl rounded-br-xl rounded-bl-xl"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}

          {typingUsers[selectedAccount?.id] && (
            <p className="text-sm text-gray-500 italic">Typing...</p>
          )}

          <div ref={bottomRef} />
        </div>

        {selectedAccount && (
          <div className="sticky bottom-0 bg-white px-4 py-3 border-t shadow-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={handleSendMessage}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full font-medium transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
