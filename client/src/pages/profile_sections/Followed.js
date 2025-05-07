import React from "react";

function Followed() {
  return (
    <div className="followed-list">
      {["User A", "User B", "User C"].map((user, i) => (
        <div key={i} className="followed-user">
          {user}
        </div>
      ))}
    </div>
  );
}

export default Followed;
