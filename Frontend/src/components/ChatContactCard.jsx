import React from "react";

function ChatContactCard() {
  return (
    <div className="flex flex-wrap gap-5 items-center px-1 py-2 rounded-xl hover:bg-gray-200">
      <div className="w-[4rem] h-[4rem] bg-gray-100 rounded-full"></div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Company Name</h2>
        <p className="text-sm text-gray-500">Role</p>
      </div>
    </div>
  );
}

export default ChatContactCard;
