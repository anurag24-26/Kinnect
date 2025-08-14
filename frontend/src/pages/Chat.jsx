import { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaCircle, FaPaperPlane, FaSmile } from "react-icons/fa";
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
  const [mobileView, setMobileView] = useState(false);
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Decode token to get userId
  useEffect(() => {
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id);
    }
  }, [token]);

  // Socket setup & fetch following list
  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join", currentUserId);

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

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("onlineUsers");
    };
  }, [currentUserId, selectedAccount]);

  // Always scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Handle selecting an account
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

      // ✅ Ensure scroll happens after render
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    } catch (err) {
      console.error("❌ Failed to load chat history", err);
      setChat([]);
    }
  };

  // Send message
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

  // Notify typing
  const handleTyping = () => {
    if (selectedAccount) {
      socket.emit("typing", {
        senderId: currentUserId,
        receiverId: selectedAccount.id,
      });
    }
  };

  // Check online status
  const isUserOnline = (userId) =>
    onlineUsers.some(
      (user) => user === userId || user?.id === userId || user?._id === userId
    );

  return (
    <div className="flex h-[80dvh] overflow-hidden bg-[#16161A] text-[#FFFFFE] font-inter">
      {/* Sidebar */}
      <aside
        className={`${
          mobileView && selectedAccount ? "hidden" : "flex"
        } flex-col w-full md:w-1/3 md:max-w-xs border-r border-[#2CB67D]/20`}
      >
        <div className="p-4 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white font-bold text-lg shadow-md">
          Messages
        </div>
        <div className="overflow-y-auto flex-1">
          {accounts.length === 0 ? (
            <p className="text-[#94A1B2] text-center mt-20">
              Follow someone to start chatting
            </p>
          ) : (
            <ul>
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => handleAccountClick(acc)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl transition-all hover:bg-[#2CB67D]/10 ${
                    selectedAccount?.id === acc.id
                      ? "bg-[#2CB67D]/20"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-9 w-10 rounded-full border-2 border-transparent animate-[spin_6s_linear_infinite]"
                          style={{
                            borderImage:
                              "linear-gradient(45deg,#7F5AF0,#2CB67D) 1",
                          }}
                        />
                      ) : (
                        <div className="h-9 w-10 rounded-full bg-[#7F5AF0]/30 flex items-center justify-center font-bold text-[#7F5AF0]">
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      <FaCircle
                        className={`absolute bottom-0 right-0 text-[10px] ${
                          isUserOnline(acc.id)
                            ? "text-[#2CB67D]"
                            : "text-[#94A1B2]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <p className="text-xs text-[#94A1B2]">Tap to chat</p>
                    </div>
                  </div>
                  {unreadMessages[acc.id] && (
                    <span className="bg-[#E63946] text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadMessages[acc.id]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat Panel */}
      <main
        className={`flex-1 flex flex-col ${
          mobileView && !selectedAccount ? "hidden" : "flex"
        }`}
      >
        {selectedAccount ? (
          <>
            {/* Header */}
            <header className="flex items-center p-4 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white shadow-lg">
              {mobileView && (
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="mr-3 text-2xl hover:scale-105 transition"
                >
                  <IoArrowBack />
                </button>
              )}
              <div className="flex items-center gap-2">
                {selectedAccount.avatar ? (
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="h-8 w-8 rounded-full border-2 border-transparent animate-[spin_6s_linear_infinite]"
                    style={{
                      borderImage: "linear-gradient(45deg,#7F5AF0,#2CB67D) 1",
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#7F5AF0]/30 flex items-center justify-center font-bold text-[#FFFFFE]">
                    {selectedAccount.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold">{selectedAccount.name}</span>
                {isUserOnline(selectedAccount.id) && (
                  <FaCircle className="text-[#2CB67D] text-[8px]" />
                )}
              </div>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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
                          ? "bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white"
                          : "bg-[#1F1F23] text-[#FFFFFE]"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              {typingUsers[selectedAccount?.id] && (
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce delay-200"></span>
                </div>
              )}
              <div ref={bottomRef} />
            </section>

            {/* Input */}
            <footer className="p-3 bg-[#1F1F23] flex gap-2 items-center">
              <button className="text-[#FF8906] text-xl hover:scale-110 transition">
                <FaSmile />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-[#16161A] border border-[#2CB67D]/40 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB67D]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] px-4 py-2 rounded-full text-white text-sm flex items-center gap-1 hover:scale-105 transition-transform shadow-md"
              >
                <FaPaperPlane />
              </button>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-[#94A1B2]">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
