import { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

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
  const [mobileView, setMobileView] = useState(false); // detect phone or desktop
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");

  // Detect viewport size for mobile/desktop view
  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followed = res.data.following.map((user) => ({
          id: user._id,
          name: user.name || user.username,
          avatar: user.avatar || null,
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const isUserOnline = (userId) =>
    onlineUsers.some(
      (user) => user === userId || user?.id === userId || user?._id === userId
    );

  return (
    <div className="flex h-screen bg-gradient-to-br from-cyan-50 to-white font-sans">
      {/* --- SIDEBAR / CHAT LIST --- */}
      <aside
        className={`w-full md:w-1/3 md:max-w-xs border-r border-gray-200 bg-white shadow-lg ${
          mobileView && selectedAccount ? "hidden" : "flex"
        } flex-col`}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg">
          Messages
        </div>
        <div className="overflow-y-auto flex-1">
          {accounts.length === 0 ? (
            <p className="text-gray-400 text-center mt-20">
              Follow someone to start chatting
            </p>
          ) : (
            <ul className="divide-y">
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => handleAccountClick(acc)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cyan-50 transition ${
                    selectedAccount?.id === acc.id
                      ? "bg-cyan-100"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      <FaCircle
                        className={`absolute bottom-0 right-0 text-[10px] ${
                          isUserOnline(acc.id)
                            ? "text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{acc.name}</p>
                      <p className="text-xs text-gray-400">Tap to chat</p>
                    </div>
                  </div>
                  {unreadMessages[acc.id] && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadMessages[acc.id]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* --- CHAT PANEL --- */}
      <main
        className={`flex-1 flex flex-col ${
          mobileView && !selectedAccount ? "hidden" : "flex"
        }`}
      >
        {selectedAccount ? (
          <>
            {/* Fixed Header */}
            <header className="flex items-center p-4 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
              {mobileView && (
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="mr-3 text-2xl text-cyan-600"
                >
                  <IoArrowBack />
                </button>
              )}
              <div className="flex items-center gap-2">
                {selectedAccount.avatar ? (
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                    {selectedAccount.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-gray-800">
                  {selectedAccount.name}
                </span>
                {isUserOnline(selectedAccount.id) && (
                  <FaCircle className="text-green-500 text-[8px]" />
                )}
              </div>
            </header>

            {/* Scrollable messages */}
            <section className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
              {chat.map((msg, i) => {
                const isSender = msg.senderId === currentUserId;
                return (
                  <div
                    key={i}
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 max-w-xs rounded-2xl shadow ${
                        isSender
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              {typingUsers[selectedAccount?.id] && (
                <div className="text-sm italic text-cyan-400 animate-pulse">
                  Typing...
                </div>
              )}
              <div ref={bottomRef} />
            </section>

            {/* Fixed Input */}
            <footer className="p-3 border-t border-gray-200 bg-white flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                onClick={handleSendMessage}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full text-sm"
              >
                Send
              </button>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
