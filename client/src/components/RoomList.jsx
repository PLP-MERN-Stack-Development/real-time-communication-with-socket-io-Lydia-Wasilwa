import React from "react";

const RoomList = ({ rooms, currentRoom, joinRoom }) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {rooms.map((room) => (
        <button
          key={room}
          onClick={() => joinRoom(room)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            room === currentRoom
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {room}
        </button>
      ))}
    </div>
  );
};

export default RoomList;
