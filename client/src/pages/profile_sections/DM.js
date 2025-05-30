import React, { useEffect, useState } from "react";
import axios from "axios";
import useUserStore from "../../components/UserStore";
import "../../style/DM.css";
import dm from '../../assets/dm.png';

function DM() {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dms/conversations/${user.id}`);
        console.log(res.data);
        setConversations(res.data);
      } catch (err) {
        console.error("DM fetch error:", err);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      axios
        .get(`http://localhost:5000/api/dms/messages/${selectedChat.id}/user/${user.id}`)
        .then((res) => setMessages(res.data));
    }
  }, [selectedChat]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    console.log(selectedChat)
    const res = await axios.post("http://localhost:5000/api/dms/messages", {
      senderId: user.id,
      receiver_id: selectedChat.user.id,
      content: newMessage,
    });
    setMessages((prev) => [...prev, res.data]);
    setNewMessage("");
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ay 0-indexli
    const year = date.getFullYear();
    return `${hours}:${minutes}  ${day}/${month}/${year}`;
  };


  return (
    <div className="dm-container">
      <div className="dm-sidebar">
        {conversations.map((conv) => {
          const otherUser = conv.user;
          return (
            <div
              key={conv.id}
              className={`dm-sidebar-item ${selectedChat?.id === conv.id ? "selected" : ""}`}
              onClick={() => setSelectedChat(conv)}
            >
              {otherUser.name}
            </div>
          );
        })}
      </div>

      <div className="dm-chat">
        {selectedChat ? (
          <>
            <div className="dm-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`dm-message ${msg.sender_id === user.id ? "sent" : "received"}`}
                >
                  <div className="dm-message-content">{msg.content}</div>
                  <div className="dm-timestamp">{formatDate(msg.createdAt)}</div>
                </div>
              ))}
            </div>
            <div className="dm-input-container">
              <input
                type="text"
                className="dm-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="dm-send-button" onClick={handleSend}>
                <img src={dm} alt="DM" className="dm-icon" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500">Select a conversation to start messaging</div>
        )}
      </div>
    </div>
  );
}
export default DM;
