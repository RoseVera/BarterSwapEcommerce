import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Home.css';
import '../style/UserPage.css';
import auctionIcon from '../assets/auction.png';
import noImage from '../assets/no_image.png';
import coin from '../assets/coin.png';
import star from '../assets/star.png';
import followers from '../assets/followers.png';
import useUserStore from '../components/UserStore';
import dm from '../assets/dm.png';

const UserPage = () => {
  const { id } = useParams(); // user id from URL
  const [activeTab, setActiveTab] = useState('items'); // default: items
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [followersCount, setFollowersCount] = useState(0);
  const { user: currentUser } = useUserStore();
  const [isFollowing, setIsFollowing] = useState(false);

  
  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://localhost:5000/api/user/${id}`);
      setUser(res.data);
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/followers/count/${user.id}`)
        .then(res => setFollowersCount(res.data.count))
        .catch(err => console.error("Failed to fetch follower count", err));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'items') {
      const fetchItems = async () => {
        const res = await axios.get(`http://localhost:5000/api/items/user-items?userId=${id}&page=${page}`);
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
      };

      fetchItems();
    }
  }, [id, page, activeTab]);

  useEffect(() => {
    if (currentUser?.id && user?.id) {
      axios.get(`http://localhost:5000/api/followers/is-following`, {
        params: {
          follower_id: currentUser.id,
          followed_id: user.id
        }
      }).then(res => {
        setIsFollowing(res.data.isFollowing);
      }).catch(err => console.error("Failed to check follow status", err));
    }
  }, [currentUser, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // reset page
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      return;
    }
  
    try {
      if (isFollowing) {
        // Unfollow
        await axios.delete("http://localhost:5000/api/followers", {
          data: {
            follower_id: currentUser.id,
            followed_id: user.id
          }
        });
        setFollowersCount(prev => prev - 1);
        setIsFollowing(false);
      } else {
        // Follow
        await axios.post("http://localhost:5000/api/followers", {
          follower_id: currentUser.id,
          followed_id: user.id
        });
        setFollowersCount(prev => prev + 1);
        setIsFollowing(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Follow/unfollow failed.");
    }
  };

  return (
    <div className="user-profile-container">
      {/* Kullanıcı bilgileri */}
      {user && (
        <div className="user-header">
          <h1 className="user-name">{user.name}</h1>
          <p className="user-reputation"> <img
            src={star}
            alt="star"
            className="star-icon"
          /> {user.reputation}</p>

          {currentUser?.id !== user.id && (
            <button className="follow-button" onClick={handleFollowToggle}>{isFollowing ? "Unfollow" : "Follow"}</button>
          )}
          <p className="user-reputation"
            style={{ marginTop: "1.1rem" }}
          >
            <img
              src={followers}
              alt="follower"
              className="star-icon"
            />  {followersCount} </p>

          {currentUser?.id !== user.id && (
            <button className="dm-button" onClick={() => alert("DM feature coming soon!")}>
              <img src={dm} alt="DM" className="dm-icon" />
            </button>
          )}

        </div>
      )}

      {/* Tab Seçici */}
      <div className="tab-buttons">
        <button
          onClick={() => handleTabChange('items')}
          className={`tab-button ${activeTab === 'items' ? 'active-tab' : ''}`}
        >
          Items
        </button>
        <button
          onClick={() => handleTabChange('reviews')}
          className={`tab-button ${activeTab === 'reviews' ? 'active-tab' : ''}`}
        >
          Reviews
        </button>
      </div>

      {/* İçerik */}
      {activeTab === 'items' && (
        <div>
          <div className="user-item-grid">
            {Array.isArray(items) && items.map(item => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => navigate(`/item/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {item.is_bid && (
                  <img src={auctionIcon} alt="Auction" className="auction-icon" />
                )}
                <img
                  src={item.image ? item.image : noImage}
                  alt={item.title}
                  className="item-image"
                />
                <h4>{item.title}</h4>
                {item.is_bid ? (
                  <>
                    <p>
                      Starting:{" "}
                      <img
                        src={coin}
                        alt="coin"
                        className="coin-icon"
                      />
                      {item.starting_price}
                    </p>
                    {item.current_price !== null && (
                      <p>
                        Current:{" "}
                        <img
                          src={coin}
                          alt="coin"
                          className="coin-icon"
                        />
                        {item.current_price}
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    Price:{" "}
                    <img
                      src={coin}
                      alt="coin"
                      className="coin-icon"
                    />
                    {item.starting_price}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>
                &larr;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={page === p ? 'active-page' : ''}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page === totalPages}>
                &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {/* Sonraki adımda yazılacak */}
          <p>User reviews will be shown here.</p>
        </div>
      )}
    </div>
  );
};

export default UserPage;
