import React, { useState } from "react";

function DM() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="dm-container">
      <div className="chat-list">
        {["Alice", "Bob", "Charlie"].map((user) => (
          <div key={user} className="chat-user" onClick={() => setSelectedChat(user)}>
            {user}
          </div>
        ))}
      </div>
      <div className="chat-window">
        {selectedChat ? `Chat with ${selectedChat}` : "Select a chat"}
      </div>
    </div>
  );
}

export default DM;
