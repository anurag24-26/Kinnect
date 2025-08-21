import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaCircle, FaPaperPlane, FaSmile } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

// ✅ Single socket instance
const socket = io("https://kinnectbackend.onrender.com", {
  transports: ["websocket"],
  withCredentials: false,
});

// ✅ Safe JWT decode
const safeDecode = (token) => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const Chat = () => {
  const token = localStorage.getItem("token");
  const decoded = useMemo(() => (token ? safeDecode(token) : null), [token]);
  const currentUserId = decoded?.id || decoded?._id || null;

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState({});
  const [mobileView, setMobileView] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Responsive view
  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Setup socket + fetch following
  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join", currentUserId);

    const fetchFollowing = async () => {
      try {
        const res = await axios.get(
          `https://kinnectbackend.onrender.com/api/follows/${currentUserId}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const followed = (res.data?.following || []).map((user) => ({
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

    // ✅ Socket listeners
    const onReceiveMessage = (data) => {
      const isActiveThread =
        selectedAccount &&
        (data.senderId === selectedAccount.id ||
          data.receiverId === selectedAccount.id);

      if (isActiveThread) {
        setChat((prev) => {
          // avoid duplicates by checking _id
          if (prev.some((m) => m._id === data._id)) return prev;
          return [...prev, data].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
      }

      if (
        data.receiverId === currentUserId &&
        (!selectedAccount || data.senderId !== selectedAccount.id)
      ) {
        setUnreadMessages((prev) => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1,
        }));
      }
    };

    const onTyping = ({ senderId }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
      }, 1500);
    };

    const onUserOnline = (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const onUserOffline = (userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("typing", onTyping);
    socket.on("userOnline", onUserOnline);
    socket.on("userOffline", onUserOffline);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off("userOnline", onUserOnline);
      socket.off("userOffline", onUserOffline);
    };
  }, [currentUserId, token, selectedAccount]);

  // ✅ Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ✅ Load chat history
  const handleAccountClick = async (account) => {
    setSelectedAccount(account);
    setUnreadMessages((prev) => {
      const next = { ...prev };
      delete next[account.id];
      return next;
    });

    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/messages/${currentUserId}/${account.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Oldest → newest
      const sorted = (res.data || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setChat(sorted);

      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "auto" }),
        50
      );
    } catch (err) {
      console.error("❌ Failed to load chat history", err);
      setChat([]);
    }
  };

  // ✅ Send message (optimistic update)
  const handleSendMessage = () => {
    if (!selectedAccount || !message.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: selectedAccount.id,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setChat((prev) => [...prev, optimistic]);
    setMessage("");

    socket.emit(
      "sendMessage",
      {
        senderId: currentUserId,
        receiverId: selectedAccount.id,
        message: optimistic.message,
      },
      (ack) => {
        if (ack?.success && ack.message) {
          setChat((prev) => {
            // replace temp with real
            const withoutTemp = prev.filter((m) => m._id !== tempId);
            if (withoutTemp.some((m) => m._id === ack.message._id)) {
              return withoutTemp; // avoid duplicates
            }
            return [...withoutTemp, ack.message].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          });
        } else {
          setChat((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...m, failed: true } : m
            )
          );
        }
      }
    );
  };

  // ✅ Typing debounce
  const handleTyping = () => {
    if (!selectedAccount) return;
    if (typingTimeoutRef.current) return;

    socket.emit("typing", {
      senderId: currentUserId,
      receiverId: selectedAccount.id,
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 800);
  };

  const isUserOnline = (userId) => onlineUsers.has(userId);

  return (
    <div className="flex h-[80dvh] overflow-hidden bg-[#0B1220] text-[#E6F1FF] font-inter">
      {/* Sidebar */}
      <aside
        className={`${
          mobileView && selectedAccount ? "hidden" : "flex"
        } flex-col w-full md:w-1/3 md:max-w-xs border-r border-white/10`}
      >
        <div className="p-4 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white font-bold text-lg shadow-md">
          Messages
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {accounts.length === 0 ? (
            <p className="text-[#8DA2C0] text-center mt-20">
              Follow someone to start chatting
            </p>
          ) : (
            <ul className="space-y-2">
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => handleAccountClick(acc)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-2xl transition-all hover:bg-white/5 ${
                    selectedAccount?.id === acc.id
                      ? "bg-white/10 ring-1 ring-white/15"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-transparent"
                          style={{
                            borderImage:
                              "linear-gradient(45deg,#7F5AF0,#2CB67D) 1",
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#7F5AF0]/30 flex items-center justify-center font-bold text-[#7F5AF0]">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <FaCircle
                        className={`absolute bottom-0 right-0 text-[10px] ${
                          isUserOnline(acc.id)
                            ? "text-[#2CB67D]"
                            : "text-[#8DA2C0]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{acc.name}</p>
                      <p className="text-xs text-[#8DA2C0] leading-tight">
                        {isUserOnline(acc.id) ? "Online" : "Tap to chat"}
                      </p>
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
                    className="h-8 w-8 rounded-full object-cover border-2 border-transparent"
                    style={{
                      borderImage: "linear-gradient(45deg,#7F5AF0,#2CB67D) 1",
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#7F5AF0]/30 flex items-center justify-center font-bold text-[#FFFFFE]">
                    {selectedAccount.name.charAt(0).toUpperCase()}
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
              {chat.map((msg) => {
                const isSender =
                  msg.senderId === currentUserId ||
                  msg.senderId?._id === currentUserId;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 max-w-[70%] rounded-2xl shadow ${
                        isSender
                          ? "bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white"
                          : "bg-[#111827] text-[#E6F1FF]"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </div>
                      <div className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.failed && " • failed"}
                        {msg.optimistic && " • sending…"}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing dots */}
              {typingUsers[selectedAccount?.id] && (
                <div className="flex gap-1 items-center pl-1">
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] rounded-full animate-bounce delay-200"></span>
                </div>
              )}
              <div ref={bottomRef} />
            </section>

            {/* Input */}
            <footer className="p-3 bg-[#0F172A] flex gap-2 items-center border-t border-white/10">
              <button
                className="text-[#FF8906] text-xl hover:scale-110 transition"
                title="Emojis (stub)"
              >
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
                className="flex-1 bg-[#0B1220] border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2CB67D]"
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
          <div className="flex items-center justify-center flex-1 text-[#8DA2C0]">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
