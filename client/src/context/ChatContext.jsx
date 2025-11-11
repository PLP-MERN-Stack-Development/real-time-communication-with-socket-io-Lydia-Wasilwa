// import { createContext, useContext, useEffect, useState } from "react";
// import { socket } from "../socket/socket";
// import { useUser } from "@clerk/clerk-react"; // since you use Clerk

// const ChatContext = createContext();

// export function ChatProvider({ children }) {
//   const { user } = useUser();
//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typingUsers, setTypingUsers] = useState([]);

//   useEffect(() => {
//     if (!user) return;

//     // Join the chat
//     socket.emit("user_join", user.username || user.fullName || "Anonymous");

//     // Listen for messages
//     socket.on("receive_message", (message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     // Listen for online users
//     socket.on("user_list", (users) => {
//       setOnlineUsers(users);
//     });

//     // Listen for typing updates
//     socket.on("typing_users", (typingList) => {
//       setTypingUsers(typingList);
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.off("receive_message");
//       socket.off("user_list");
//       socket.off("typing_users");
//     };
//   }, [user]);

//   const sendMessage = (message) => {
//     if (message.trim() === "") return;
//     socket.emit("send_message", { message });
//   };

//   const setTyping = (isTyping) => {
//     socket.emit("typing", isTyping);
//   };

//   return (
//     <ChatContext.Provider value={{ user, messages, onlineUsers, typingUsers, sendMessage, setTyping }}>
//       {children}
//     </ChatContext.Provider>
//   );
// }

// export const useChat = () => useContext(ChatContext);
