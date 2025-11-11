import React from "react";

const Notification = ({ text }) => {
  return (
    <div className="bg-yellow-100 text-yellow-800 p-2 rounded-md text-sm my-1 text-center">
      {text}
    </div>
  );
};

export default Notification;
