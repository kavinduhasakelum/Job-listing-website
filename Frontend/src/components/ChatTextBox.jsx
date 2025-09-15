
import React from "react";

function ChatTextBox({ user = false }) {
  return (
    <div
      className={`flex ${
        user ? "flex-row-reverse" : ""
      } gap-4 justify-start items-end p-4`}
    >
      <div className="w-[3rem] h-[3rem] bg-gray-100 rounded-full"></div>
      <div className="flex flex-col gap-3 px-5 py-4">
        <p className="text-sm font-light text-gray-400">user name</p>
        <div
          className={`max-w-md ${
            user ? "bg-[#2091e2] text-white" : "bg-gray-100 text-black"
          } p-4 rounded-xl`}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe sit
          temporibus, iste dignissimos tenetur, culpa vitae deleniti natus
          itaque qui vero molestiae id odit sed dolores sapiente laborum
          quisquam facere?
        </div>
      </div>
    </div>
  );
}

export default ChatTextBox;
