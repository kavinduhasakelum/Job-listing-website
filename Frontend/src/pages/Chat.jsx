import React from "react";
import SearchInput from "../components/SearchInput";
import ChatContactCard from "../components/ChatContactCard";
import ChatTextBox from "../components/ChatTextBox";

function ChatPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="flex gap-8 w-full">
        <div className="flex flex-col justify-start basis-1/4 overflow-auto gap-6">
          <h1 className="text-2xl font-bold p-4">Messaging</h1>
          <SearchInput />
          <ChatContactCard />
          <ChatContactCard />
          <ChatContactCard />
          <ChatContactCard />
          <ChatContactCard />
          <ChatContactCard />
        </div>
        <div className="flex flex-col basis-3/4 relative h-screen">
          <h1 className="text-3xl font-bold p-4">Company Name</h1>
          <div className="flex flex-col gap-2 pb-20 overflow-y-auto">
            <ChatTextBox />
            <ChatTextBox user={true} />
            <ChatTextBox />
            <ChatTextBox user={true} />
          </div>
          <div className="absolute bottom-0 left-0 w-full px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              className="bg-blue-500 text-white rounded-xl px-4 py-2 font-medium hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
