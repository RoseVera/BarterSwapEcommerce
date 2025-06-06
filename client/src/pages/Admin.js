import React, { useState } from "react";
import "../style/Profile.css";
import Dashboard from "./admin_sections/Dashboard";
import Users from "./admin_sections/Users";
import Items from "./admin_sections/Items";
import Transactions from "./admin_sections/Transactions";


const sections = {
  Dashboard: <Dashboard />, 
  Users: <Users />,
  Items: <Items />,
  Transactions: <Transactions />
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
