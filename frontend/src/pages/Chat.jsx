import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaCircle, FaPaperPlane, FaSmile } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { BsCheck, BsCheckAll } from "react-icons/bs";

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

// Simple emoji picker with a limited emoji set for example
const emojis = [
  "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊",
  "😋", "😎", "😍", "😘", "🥰", "😚", "🙂", "🤗", "🤩", "🤔",
  "🤨", "😐", "😑", "🙄", "😏", "😣", "😥", "😮", "😴", "🤤",
  "😪", "😫", "😭", "😤", "😡", "🤬", "😱", "😳", "🤯", "😇",
  "🥳", "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏", "🙌",
  "👐", "🙏", "✋", "👊", "🤝", "👋", "🎉", "🎊", "🎂", "🎁",
  "🍰", "🍕", "🍔", "🍟", "🍩", "🍪", "🍦", "🍫", "🍻", "🥂",
  "🍷", "🍺", "🌸", "🌹", "🌻", "🌞", "🌙", "⭐", "🌈", "☀️",
  "🌧️", "🌍", "🌎", "🌏", "🐶", "🐱", "🐼", "🐵", "🦁", "🐯",
  "🐰", "🐸", "🐧", "🐦", "🐢", "❤️", "🧡", "💛", "💚", "💙",
  "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
  "💘", "💝"
];


const Chat = () => {
  const token = localStorage.getItem("token");
  const decoded = useMemo(() => (token ? safeDecode(token) : null), [token]);
  const currentUserId = decoded?.id || decoded?._id || null;

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState({});
  const [mobileView, setMobileView] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
          if (prev.some((m) => m._id === data._id)) return prev;
          return [...prev, data].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });

        socket.emit("messageDelivered", { messageId: data._id });
        socket.emit("messageRead", { messageId: data._id });
      }

      if (
        data.receiverId === currentUserId &&
        (!selectedAccount || data.senderId !== selectedAccount.id)
      ) {
        setUnreadMessages((prev) => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1,
        }));

        socket.emit("messageDelivered", { messageId: data._id });
      }
    };

    const onMessageStatusUpdate = ({ messageId, status }) => {
      setChat((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m))
      );
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
    socket.on("messageStatusUpdate", onMessageStatusUpdate);
    socket.on("typing", onTyping);
    socket.on("userOnline", onUserOnline);
    socket.on("userOffline", onUserOffline);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("messageStatusUpdate", onMessageStatusUpdate);
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

    setLoadingChat(true);

    try {
      const res = await axios.get(
        `https://kinnectbackend.onrender.com/api/messages/${currentUserId}/${account.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sorted = (res.data || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setChat(sorted);

      sorted.forEach((msg) => {
        if (msg.receiverId === currentUserId && msg.status !== "read") {
          socket.emit("messageRead", { messageId: msg._id });
        }
      });
    } catch (err) {
      console.error("❌ Failed to load chat history", err);
      setChat([]);
    } finally {
      setLoadingChat(false);
    }

    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "auto" }),
      50
    );
  };

  // ✅ Send message (with reply support)
  const handleSendMessage = () => {
    if (!selectedAccount || !message.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: selectedAccount.id,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "sent",
      optimistic: true,
      replyTo: replyTo ? { _id: replyTo._id, message: replyTo.message } : null,
    };

    setChat((prev) => [...prev, optimistic]);
    setMessage("");
    setShowEmojiPicker(false);
    setReplyTo(null);

    socket.emit(
      "sendMessage",
      {
        senderId: currentUserId,
        receiverId: selectedAccount.id,
        message: optimistic.message,
        replyTo: replyTo ? replyTo._id : null,
      },
      (ack) => {
        if (ack?.success && ack.message) {
          setChat((prev) => {
            const withoutTemp = prev.filter((m) => m._id !== tempId);
            if (withoutTemp.some((m) => m._id === ack.message._id)) {
              return withoutTemp;
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

  // ✅ Render tick marks
  const renderTicks = (msg) => {
    if (msg.failed) return " • failed";
    if (msg.optimistic) return " • sending…";
    if (msg.senderId !== currentUserId) return "";

    if (msg.status === "sent") return <BsCheck className="inline text-gray-400" />;
    if (msg.status === "delivered") return <BsCheckAll className="inline text-gray-400" />;
    if (msg.status === "read") return <BsCheckAll className="inline text-blue-500" />;
    return "";
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex h-[90dvh] overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#121a2f] to-[#1C2333] text-[#E6F1FF] font-inter rounded-xl shadow-xl relative">
      {/* Sidebar */}
      <aside
        className={`${
          mobileView && selectedAccount ? "hidden" : "flex"
        } flex-col w-full md:w-1/3 lg:w-1/4 border-r border-white/10 backdrop-blur-md bg-white/5`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 text-center font-bold text-lg text-white bg-gradient-to-r from-[#9682cf] to-[#7F5AF0] shadow-md rounded-tl-3xl">
          💬 Messages
        </div>

        {/* Users List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
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
                  className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all backdrop-blur hover:bg-white/10 ${
                    selectedAccount?.id === acc.id
                      ? "bg-gradient-to-r from-[#7F5AF0]/30 to-[#2CB67D]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {acc.avatar ? (
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="h-10 w-10 rounded-full object-cover border border-[#2CB67D]/40 shadow-md"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#7F5AF0]/40 flex items-center justify-center font-bold text-white shadow">
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <FaCircle
                        className={`absolute bottom-0 right-0 text-[10px] ${
                          isUserOnline(acc.id) ? "text-[#2CB67D]" : "text-[#8DA2C0]"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{acc.name}</p>
                      <p className="text-xs text-[#8DA2C0]">
                        {isUserOnline(acc.id) ? "Online" : "Tap to chat"}
                      </p>
                    </div>
                  </div>
                  {unreadMessages[acc.id] && (
                    <span className="bg-[#E63946] text-white text-xs min-w-[20px] px-2 py-0.5 rounded-full flex items-center justify-center shadow">
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
        } relative`}
      >
        {selectedAccount ? (
          <>
            {/* Chat Header */}
            <header className="flex items-center gap-3 p-2 bg-gradient-to-r from-[#7F5AF0] to-[#124772] text-white shadow-md rounded-tr-3xl">
              {mobileView && (
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="mr-2 text-xl hover:scale-110 transition-transform"
                >
                  <IoArrowBack />
                </button>
              )}
              <div className="flex items-center gap-3">
                {selectedAccount.avatar ? (
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="h-9 w-9 rounded-full object-cover border border-white/30 shadow"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#7F5AF0]/50 flex items-center justify-center font-bold text-white">
                    {selectedAccount.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{selectedAccount.name}</p>
                  <p className="text-xs opacity-80">
                    {isUserOnline(selectedAccount.id) ? "Online ✅" : "Offline ❌"}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-y-auto p-5 space-y-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
              {loadingChat ? (
                <div className="flex justify-center items-center h-full text-[#8DA2C0] animate-pulse">
                  Loading messages...
                </div>
              ) : chat.length > 0 ? (
                chat.map((msg) => {
                  const isSender =
                    msg.senderId === currentUserId ||
                    msg.senderId?._id === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      onClick={() => setReplyTo(msg)}
                    >
                      <div
                        className={`px-5 py-3 rounded-2xl shadow max-w-[70%] transition-all hover:scale-[1.01] ${
                          isSender
                            ? "bg-blue-600/80 text-white backdrop-blur-md"
                            : "bg-white/10 backdrop-blur-md text-gray-100"
                        }`}
                      >
                        {msg.replyTo && (
                          <div className="text-xs bg-black/20 p-2 rounded mb-2 border-l-2 border-[#7F5AF0]">
                            ↪ {msg.replyTo.message}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                        <div className="text-[11px] opacity-70 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {renderTicks(msg)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex justify-center text-[#8DA2C0]">No messages yet</div>
              )}

              {/* Typing dots */}
              {!loadingChat && typingUsers[selectedAccount?.id] && (
                <div className="flex items-center justify-start pl-3">
                  <div className="bg-white/10 py-1 px-3 rounded-full flex gap-2">
                    <span className="w-2 h-2 bg-[#7F5AF0] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#2CB67D] rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-[#FF8906] rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </section>

            {/* Reply banner */}
            {replyTo && (
              <div className="bg-[#1E293B]/70 p-2 text-sm text-gray-200 border-l-4 border-[#7F5AF0] flex items-center justify-between">
                <span>
                  Replying to:{" "}
                  <span className="text-white font-medium">{replyTo.message}</span>
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="ml-3 text-red-400 text-xs"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Input */}
            <footer className="p-4 flex gap-3 items-center backdrop-blur bg-[#0B1220]/70 border-t border-white/20 relative">
              <button
                className="text-[#FF8906] text-2xl hover:scale-110 transition z-20"
                title="Emojis"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                <FaSmile />
              </button>

              <input
                type="text"
                value={message}
                disabled={loadingChat}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#2CB67D]"
              />

              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] p-3 rounded-full text-white hover:scale-110 transition-transform shadow-lg"
              >
                <FaPaperPlane />
              </button>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 bg-[#1C2333] border border-white/20 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 z-30">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-2xl hover:scale-110 transition"
                      type="button"
                      aria-label={`Insert emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-[#8DA2C0]">
            👈 Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
