import React, { useState } from "react";
import axios from "axios";
import useUserStore from "../../components/UserStore";


function UserProfile() {
  const { user } = useUserStore();
  const [name, setName] = useState(user.name);
  const [studentId, setStudentId] = useState(user.student_id);
  const [phone, setPhone] = useState(user.phone);


  const handleUpdate = async () => {
    try {
      const userId = user.id; // Giriş yapan kullanıcının ID’si (dinamik olarak alman gerekebilir)
      await axios.put(`http://localhost:5000/api/user/update/${userId}`, {
        name,
        student_id: studentId,
        phone,
      });
      alert("User info updated successfully.");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Error updating user info.");
    }
  };

  return (
    <div className="profile-form">
      <input placeholder= {user.name} value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder={user.student_id} value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      <input placeholder={user.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}

export default UserProfile;
