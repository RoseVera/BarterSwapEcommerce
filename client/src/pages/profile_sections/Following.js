import React, { useEffect, useState, useRef } from "react";
import useUserStore from "../../components/UserStore";
import axios from "axios";
import { Link } from "react-router-dom";
import followers from '../../assets/followers.png';
import "../../style/Followed.css";
import { toast } from "react-toastify";

function Following() {
  const { user } = useUserStore();
  const [followedUsers, setFollowedUsers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const didFetch = useRef(false);

  useEffect(() => {
    if (user) {
      setFollowedUsers([]);
      setCursor(null);
      setHasMore(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && cursor === null && !didFetch.current) {
      fetchFollowedUsers();
      didFetch.current = true;
    }
  }, [cursor, user]);

  const fetchFollowedUsers = async () => {
    if (!user || !hasMore) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/followers/followed/${user.id}`, {
        params: { cursor, limit },
      });

      setFollowedUsers(prev => [...prev, ...res.data.followedUsers]);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Failed to fetch followed users", err);
    }
  };

  const handleUnfollow = async (followedId) => {
    try {
      await axios.delete("http://localhost:5000/api/followers", {
        data: { follower_id: user.id, followed_id: followedId },
      });
      setFollowedUsers([]);
      setCursor(null);
      setHasMore(true);
      await fetchFollowedUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unfollow failed.");
    }
  };

  return (
    <div className="followed-list">
      <h2 className="followed-count">
        <img src={followers} alt="follower" className="star-icon" />
        {followedUsers.length}
      </h2>

      {followedUsers.map((f) => (
        <div key={f.id} className="followed-user">
          <Link to={`/user/${f.id}`} className="followed-name">
            {f.name}
          </Link>
          <button className="unfollow-button" onClick={() => handleUnfollow(f.id)}>
            Unfollow
          </button>
        </div>
      ))}

      {hasMore && (
        <div className="load-more">
          <button className="modal-button" onClick={fetchFollowedUsers}>Load More</button>
        </div>
      )}
    </div>
  );
}

export default Following;
