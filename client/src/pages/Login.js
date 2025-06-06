import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../components/UserStore';
import axios from 'axios';
import '../style/Login.css';
import '../style/Home.css';
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

      const data = res.data; // ✅ axios otomatik parse eder
      setUser(data.user);
      if (data.user.role == "ADMIN") {
        console.log(data.user.role)

        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Login failed");
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