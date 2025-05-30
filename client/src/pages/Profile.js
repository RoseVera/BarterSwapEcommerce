import React, { useState } from "react";
import "../style/Profile.css";
import Stats from "./profile_sections/Stats";
import MyItems from "./profile_sections/MyItems";
import PurchaseHistory from "./profile_sections/PurchaseHistory";
import DM from "./profile_sections/DM";
import Following from "./profile_sections/Following";
import UserProfile from "./profile_sections/UserProfile";

const sections = {
  Stats: <Stats />, 
  "My Items": <MyItems />,
  "Purchase History": <PurchaseHistory />,
  DM: <DM />,
  Following: <Following />,
  Profile: <UserProfile />,
};

function Profile() {
  const [activeSection, setActiveSection] = useState("Stats");

  return (
    <div className="profile-container">
      <div className="sidebar">
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            className={`menu-button ${activeSection === key ? "active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="main-content">{sections[activeSection]}</div>
    </div>
  );
}

export default Profile;
