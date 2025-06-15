import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../components/UserStore';
import axios from 'axios';
import '../style/Login.css';
import '../style/Home.css';
import { toast } from "react-toastify";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      }, { withCredentials: true });

      const data = res.data;
      if (data.user.role == "ADMIN") {
        console.log(data.user.role)

        navigate("/profile");
        toast.success("Login successful!");
      } else {
        toast.success("Login successful!");
        navigate("/");

      }

      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.success("Login successful!");
      }
    }
  };

  return (
    <div className="home-container">
      <div className="login-container">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button className="login-button" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;