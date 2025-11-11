// import { useState, useEffect, useRef } from "react";
// import { useChat } from "../context/ChatContext";

// export default function ChatRoom() {
//   const { user, messages, sendMessage, typingUsers, onlineUsers, setTyping } = useChat();
//   const [message, setMessage] = useState("");
//   const messageEndRef = useRef(null);

//   // Auto-scroll to bottom on new message
//   useEffect(() => {
//     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   function handleSubmit(e) {
//     e.preventDefault();
//     sendMessage(message);
//     setMessage("");
//     setTyping(false);
//   }

//   function handleTyping(e) {
//     setMessage(e.target.value);
//     setTyping(e.target.value.length > 0);
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <header className="bg-blue-600 text-white p-4 flex justify-between">
//         <h1 className="text-lg font-semibold">💬 Global Chat Room</h1>
//         <p className="text-sm">Online: {onlineUsers.length}</p>
//       </header>

//       <main className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
//             <div className="bg-white shadow p-2 rounded-md max-w-xs">
//               <p className="font-semibold text-sm">{msg.sender}</p>
//               <p>{msg.message}</p>
//               <p className="text-xs text-gray-400 text-right">
//                 {new Date(msg.timestamp).toLocaleTimeString()}
//               </p>
//             </div>
//           </div>
//         ))}
//         <div ref={messageEndRef} />
//       </main>

//       {/* Typing indicator */}
//       {typingUsers.length > 0 && (
//         <div className="text-gray-500 text-sm px-4">
//           {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
//         </div>
//       )}

//       {/* Message input */}
//       <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex gap-2">
//         <input
//           value={message}
//           onChange={handleTyping}
//           placeholder="Type your message..."
//           className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Send</button>
//       </form>
//     </div>
//   );
// }
