import React, { useEffect, useState } from "react";
import useUserStore from "../../components/UserStore";
import axios from "axios";
import { useNavigate,Link} from "react-router-dom";
import followers from '../../assets/followers.png';
import "../../style/Followed.css";
import "../../style/Home.css";

function Following() {
  const { user } = useUserStore();
  const [followedUsers, setFollowedUsers] = useState([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;


  const fetchFollowedUsers = async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/followers/followed/${user.id}?page=${currentPage}&limit=${limit}`
      );
      setFollowedUsers(res.data.followedUsers);

      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch followed users", err);
    }
  };

  useEffect(() => {
    fetchFollowedUsers();
  }, [user, currentPage]);

  const handleUnfollow = async (followedId) => {
    try {
      await axios.delete("http://localhost:5000/api/followers", {
        data: { follower_id: user.id, followed_id: followedId },
      });
      // Sayfayı sıfırla ve yeniden yükle
      setCurrentPage(1);
      await fetchFollowedUsers(); 
    } catch (err) {
      alert(err.response?.data?.message || "Unfollow failed.");
    }
  };

  return (
    <div className="followed-list">
      <h2 className="followed-count"> 
        <img
                      src={followers}
                      alt="follower"
                      className="star-icon"
                    />  {total} 
                  </h2>

      {followedUsers.map((f) => (
        <div key={f.id} className="followed-user">
          <Link to={`/user/${f.id}`} className="followed-name">
            {f.name}
          </Link>
          <button
            className="unfollow-button"
            onClick={() => handleUnfollow(f.id)}
          >
            Unfollow
          </button>
        </div>
      ))}

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&larr;</button>
        <span> {currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&rarr;</button>
      </div>
    </div>
  );
}

export default Following;
