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
  <aside className="w-full md:w-1/3 md:max-w-xs h-[320px] md:h-full border-b md:border-b-0 md:border-r border-cyan-200 bg-white shadow-lg z-20 p-6 pt-8 overflow-x-hidden overflow-y-auto transition-all flex-shrink-0">
    <h3 className="text-2xl font-extrabold mb-6 text-cyan-900">Chats</h3>
    {accounts.length === 0 ? (
      <p className="text-base text-gray-400 py-12 text-center">
        Follow someone to start chatting.
      </p>
    ) : (
      <ul className="space-y-3">
        {accounts.map(acc => (
          <li
            key={acc.id}
            onClick={() => handleAccountClick(acc)}
            className={`group flex items-center justify-between gap-2 px-5 py-3 rounded-xl border-2 cursor-pointer select-none
              transition
              ${selectedAccount?.id === acc.id
                ? "bg-cyan-100 border-cyan-600 shadow-md"
                : "bg-white border-transparent hover:bg-cyan-50 hover:border-cyan-300"
              }`}
          >
            <span className="flex items-center gap-3 text-base font-medium text-gray-900">
              <span className="h-9 w-9 flex items-center justify-center rounded-full bg-cyan-50 text-cyan-700 font-bold text-lg capitalize shadow-sm">
                {acc.avatar 
                  ? <img src={acc.avatar} alt={acc.name} className="rounded-full max-w-full max-h-full" />
                  : acc.name.charAt(0)}
              </span>
              {acc.name}
              {unreadMessages[acc.id] &&
                <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadMessages[acc.id]}
                </span>
              }
            </span>
            <FaCircle
              className={`text-xs ${isUserOnline(acc.id) ? "text-green-500" : "text-gray-300"}`}
            />
          </li>
        ))}
      </ul>
    )}
  </aside>

  {/* Chat Area */}
  <main className="flex-1 flex flex-col h-full bg-white shadow-md">
    {/* Header */}
    <header className="p-6 border-b border-cyan-100 bg-cyan-50 shadow-inner">
      <h4 className="text-xl font-bold text-cyan-800 tracking-tight">
        {selectedAccount
          ? `Chat with ${selectedAccount.name}`
          : "Select a user to start chatting"}
      </h4>
    </header>
    
    {/* Chat Messages Scroll Area */}
    <section className="flex-1 min-h-0 overflow-y-auto px-4 py-6 bg-gray-50 space-y-4">
      {chat.map((msg, i) => {
        const isSender = msg.senderId === currentUserId;
        return (
          <div key={i} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
            <div className={`
              px-5 py-3 max-w-lg text-base shadow
              ${isSender
                ? "bg-cyan-500 text-white rounded-tl-2xl rounded-b-2xl rounded-tr-md"
                : "bg-white border border-cyan-100 text-cyan-800 rounded-tr-2xl rounded-b-2xl rounded-tl-md"
              }
            `}>
              {msg.message}
            </div>
          </div>
        )
      })}
      {typingUsers[selectedAccount?.id] && (
        <div className="text-sm italic text-cyan-400 animate-pulse">Typing...</div>
      )}
      <div ref={bottomRef} />
    </section>
    
    {/* Input Box */}
    {selectedAccount && (
      <footer className="bg-white px-6 py-4 border-t border-cyan-100 shadow relative">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={e => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={e => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-5 py-2 border border-cyan-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-cyan-300 transition"
          />
          <button
            onClick={handleSendMessage}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-full font-semibold shadow transition"
          >
            Send
          </button>
        </div>
      </footer>
    )}
  </main>
</div>

  );
};

export default Chat;
