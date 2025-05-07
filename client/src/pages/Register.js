import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Register.css';
import '../style/Home.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", student_id: "", birthday: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="home-container">
    <div className="register-container">
      <h2>Register</h2>
      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="register-input" />
      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="register-input" />
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="register-input" />
      <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="register-input" />
      <input type="text" name="student_id" value={form.student_id} onChange={handleChange} placeholder="Student ID" className="register-input" />
      <input type="date" name="birthday" value={form.birthday} onChange={handleChange} placeholder="Birthday" className="register-input" />
      <button className="register-button" onClick={handleRegister}>Register</button>
    </div>
      </div>
  );
}

export default Register;