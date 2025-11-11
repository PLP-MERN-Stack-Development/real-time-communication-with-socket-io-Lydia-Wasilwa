import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import RoomList from "./RoomList";
import Message from "./Message";
import Notification from "./Notification";

const socket = io("http://localhost:5000");

const Chat = () => {
  const { user } = useUser();
  const username = user
    ? user.fullName || user.username || user.emailAddresses[0].emailAddress
    : "Anonymous";

  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [input, setInput] = useState("");
  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [room, setRoom] = useState("Global");
  const [roomsList] = useState(["Global", "Sports", "Music", "Tech"]);

  const fileInputRef = useRef(null);

  // --- Socket Events ---
  useEffect(() => {
    if (!user) return;

    // Join global
    socket.emit("user_join", username);
    socket.emit("join_room", room);

    // Incoming messages
    socket.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );
    socket.on("room_message", (msg) => setMessages((prev) => [...prev, msg]));

    // Private messages
    socket.on("private_message", (msg) => {
      if (
        privateChatUser &&
        (msg.senderId === privateChatUser.id || msg.senderId === user.id)
      ) {
        setPrivateMessages((prev) => [...prev, msg]);
      }
    });

    // Update message for reactions or read
    socket.on("update_message", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
      );
      setPrivateMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
      );
    });

    // Online users
    socket.on("user_list", (users) => setOnlineUsers(users));

    // Typing
    socket.on("typing_users", (usersTyping) => {
      setTypingUsers(usersTyping.filter((u) => u !== username));
    });
    socket.on("typing_users_room", (usersTyping) => {
      setTypingUsers(usersTyping.filter((u) => u !== username));
    });

    // Notifications
    socket.on("user_joined", ({ username }) =>
      setNotifications((prev) => [...prev, `${username} joined the chat`])
    );
    socket.on("user_left", ({ username }) =>
      setNotifications((prev) => [...prev, `${username} left the chat`])
    );

    return () => socket.off();
  }, [user, privateChatUser, room]);

  // --- Handlers ---
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (privateChatUser) {
      socket.emit("private_message", {
        toId: privateChatUser.id,
        message: input,
      });
      setPrivateMessages((prev) => [
        ...prev,
        { message: input, senderId: user.id, senderName: username },
      ]);
    } else {
      socket.emit("send_room_message", { roomName: room, text: input });
      setMessages((prev) => [
        ...prev,
        { senderName: username, text: input, senderId: user.id },
      ]);
    }

    setInput("");
    socket.emit("typing", false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", e.target.value.trim().length > 0);
  };

  const joinRoom = (newRoom) => {
    setRoom(newRoom);
    setMessages([]);
    socket.emit("join_room", newRoom);
  };

  const startPrivateChat = (user) => {
    setPrivateChatUser(user);
    setPrivateMessages([]);
  };

  const leavePrivateChat = () => setPrivateChatUser(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        name: file.name,
        type: file.type,
        content: reader.result, // base64
      };

      if (privateChatUser) {
        socket.emit("private_message", {
          toId: privateChatUser.id,
          message: "",
          file: fileData,
        });
        setPrivateMessages((prev) => [
          ...prev,
          { file: fileData, senderId: user.id, senderName: username },
        ]);
      } else {
        socket.emit("send_file", { roomName: room, file: fileData });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-4 flex flex-col">
      {/* Rooms */}
      <RoomList rooms={roomsList} currentRoom={room} joinRoom={joinRoom} />

      {/* Online Users */}
      <div className="flex flex-wrap gap-2 mb-2">
        {onlineUsers.map((u) => (
          <button
            key={u.id}
            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200"
            onClick={() => startPrivateChat(u)}
          >
            🟢 {u.username}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50">
        {(privateChatUser ? privateMessages : messages).map((msg, i) => (
          <Message key={i} msg={msg} currentUserId={user.id} />
        ))}

        {/* Typing */}
        {typingUsers.length > 0 && (
          <p className="text-sm text-gray-500 italic mt-2">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </p>
        )}
      </div>

      {/* Notifications */}
      {notifications.map((note, i) => (
        <Notification key={i} text={note} />
      ))}

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-3 py-2 rounded-lg"
        >
          📎
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
