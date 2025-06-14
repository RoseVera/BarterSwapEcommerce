import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Header from './components/Header';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import useUserStore from '../src/components/UserStore';
import ItemDetail from './pages/ItemDetail';
import User from './pages/UserPage';
import Admin from './pages/Admin';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const setUser = useUserStore(state => state.setUser);
  const setIsUserChecked = useUserStore(state => state.setIsUserChecked);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
        setUser(res.data.user);
        console.log(res.data.user)
      } catch (err) {
        // Do nothing
      } finally {
        setIsUserChecked(true);
      }
    };
    checkUser();
  }, []);


  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/user/:id" element={<User />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
