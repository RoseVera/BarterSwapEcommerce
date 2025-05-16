import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Header.css';
import logo from '../assets/logov4.png';
import profileIcon from '../assets/user.png';
import awningIcon from '../assets/awning3.png';
import coin from '../assets/coin.png';


import useUserStore from '../components/UserStore';

function Header() {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    clearUser();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" onClick={handleLogoClick} />
        </div>
        <div className="header-right">
          {user ? (
            <div className="user-info">
              
              <img
                src={coin}
                alt="coin"
                style={{ width: "20px", verticalAlign: "middle", marginRight: "-8px", marginBottom: "1px" }}
              />
               <span className="welcome-message"> {user.balance}</span>
              <span className="welcome-message"> {user.name}</span>
              <img
                src={profileIcon}
                alt="Profile"
                className="profile-icon"
                onClick={handleProfileClick}
              />
              <button className="header-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login"><button className="header-button">Login</button></Link>
              <Link to="/register"><button className="header-button">Sign In</button></Link>
            </>
          )}
        </div>

      </header>
      <div className="awning-row">
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />
        <img src={awningIcon} alt="Awning" className="awning-image" />

      </div>     </>
  );
}


export default Header;