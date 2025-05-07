import React from "react";

function UserProfile() {
  return (
    <div className="profile-form">
      <h2>User Information</h2>
      <input placeholder="Name" />
      <input placeholder="Email" />
      <input placeholder="Phone" />
      <button>Update</button>
    </div>
  );
}

export default UserProfile;
