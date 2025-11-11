import React, { useState } from "react";

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "👏"]; // example emojis

const Message = ({ msg, currentUserId, socket, username }) => {
  const [showEmojis, setShowEmojis] = useState(false);

  const handleAddReaction = (emoji) => {
    if (!socket) return;
    socket.emit("add_reaction", {
      messageId: msg.id,
      reaction: emoji,
      userName: username,
    });
    setShowEmojis(false);
  };

  return (
    <div
      className={`my-2 p-2 rounded-lg ${
        msg.senderId === currentUserId
          ? "bg-blue-100 text-right"
          : "bg-gray-100 text-left"
      }`}
    >
      {msg.senderName && (
        <p className="text-sm font-semibold text-gray-700">{msg.senderName}</p>
      )}

      {/* Text message */}
      {msg.text && <p className="text-gray-800">{msg.text}</p>}

      {/* File/Image message */}
      {msg.file && (
        <div className="mt-1">
          {msg.file.type.startsWith("image/") ? (
            <img
              src={msg.file.content}
              alt={msg.file.name}
              className="max-w-xs rounded-lg"
            />
          ) : (
            <a
              href={msg.file.content}
              download={msg.file.name}
              className="text-blue-600 underline"
            >
              {msg.file.name}
            </a>
          )}
        </div>
      )}

      {/* Reactions display */}
      {msg.reactions && msg.reactions.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-1">
          {msg.reactions.map((r, i) => (
            <span
              key={i}
              className="bg-gray-200 px-2 py-0.5 rounded-full text-sm"
              title={r.userName}
            >
              {r.reaction}
            </span>
          ))}
        </div>
      )}

      {/* Emoji picker toggle */}
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          🙂
        </button>

        {showEmojis && (
          <div className="flex gap-1 mt-1 flex-wrap bg-white border rounded-lg p-1 shadow-lg absolute z-10">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="text-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;

// import React, { useState } from "react";

// const Message = ({ msg, currentUserId }) => {
//   const [showReactions, setShowReactions] = useState(false);
//   const [localReactions, setLocalReactions] = useState(msg.reactions || []);

//   const isOwnMessage = msg.senderId === currentUserId;

//   const handleReaction = (emoji) => {
//     // Emit reaction to server
//     const socket = window.socket; // assuming socket is global or passed via context
//     socket.emit("add_reaction", { messageId: msg.id, reaction: emoji, userName: msg.senderName });
//     setLocalReactions([...localReactions, { reaction: emoji, userName: msg.senderName }]);
//   };

//   return (
//     <div className={`my-2 p-2 rounded-lg ${isOwnMessage ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}>
//       <p className="text-sm font-semibold text-gray-700">{msg.senderName}</p>

//       {/* Message content */}
//       {msg.text && <p className="text-gray-800">{msg.text}</p>}

//       {msg.file && (
//         <div className="my-1">
//           {msg.file.type.startsWith("image/") ? (
//             <img src={msg.file.content} alt={msg.file.name} className="max-w-xs rounded-md" />
//           ) : (
//             <a
//               href={msg.file.content}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:underline"
//             >
//               📄 {msg.file.name}
//             </a>
//           )}
//         </div>
//       )}

//       {/* Reactions */}
//       <div className="flex items-center gap-1 mt-1">
//         {localReactions.map((r, i) => (
//           <span key={i} className="text-sm">{r.reaction}</span>
//         ))}

//         <button
//           onClick={() => setShowReactions(!showReactions)}
//           className="ml-2 text-sm text-gray-500 hover:text-gray-700"
//         >
//           🙂
//         </button>

//         {showReactions && (
//           <div className="absolute bg-white border shadow-md rounded-md p-1 flex gap-1">
//             {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
//               <button key={emoji} onClick={() => handleReaction(emoji)} className="text-lg">
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Read receipts */}
//       {msg.readBy && msg.readBy.length > 0 && (
//         <p className="text-xs text-gray-500 mt-1">
//           Read by: {msg.readBy.join(", ")}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Message;
