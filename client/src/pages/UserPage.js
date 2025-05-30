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
import whiteStar from '../assets/whiteStar.png';
import yellowStar from '../assets/yellowStar.png';
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
  const [reputation, setReputation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsCursor, setReviewsCursor] = useState(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [showDMModal, setShowDMModal] = useState(false);
  const [dmMessage, setDmMessage] = useState('');


  useEffect(() => {
    if (activeTab === "reviews") {
      loadMoreReviews(true);
    }
  }, [activeTab]);

  const loadMoreReviews = async (reset = false) => {
    if (loadingReviews || (!reset && !hasMoreReviews)) return;
    setLoadingReviews(true);

    try {
      console.log("cursor ", reviewsCursor)
      const res = await axios.get(`http://localhost:5000/api/reviews/user/${id}`, {
        params: {
          cursor: reset ? undefined : reviewsCursor,
          limit: 10,
        }
      });

      const newReviews = res.data.reviews;
      if (reset) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      if (newReviews.length < 1) {
        setHasMoreReviews(false);
      }
      console.log("next cursor ", res.data.nextCursor)

      setReviewsCursor(res.data.nextCursor);
    } catch (err) {
      console.error("Review fetch failed:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  //Fetch Reputation
  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/reputation/${id}`);
        console.log("rep ", res.data.reputation)
        setReputation(res.data.reputation);
      } catch (err) {
        console.error("Failed to fetch reputation", err);
      }
    };

    fetchReputation();
  }, [id]);

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

  const handleDMClick = () => {
    if (!currentUser) {
      alert("Please log in to send a message.");
      return;
    }
    setShowDMModal(true);
  };

  const sendMessage = async () => {
    if (!dmMessage.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/dms/messages", {
        senderId: currentUser.id,
        receiver_id: user.id,
        content: dmMessage.trim()
      });

      alert("Message sent!");
      setShowDMModal(false);
      setDmMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message.");
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
          />  {reputation !== null ? reputation : "Loading..."}</p>

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
            <button className="dm-button" onClick={handleDMClick}>
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
        <div className="reviews-container">
          {reviews.map((rev, index) => (
            <div key={rev.id || index} className="review-card">
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    src={i < rev.rating ? yellowStar : whiteStar}
                    alt="star"
                    className="star-icon"
                  />
                ))}
              </div>

              {/* Kullanıcı adı ve tarih */}
              <div className="review-meta">
                <span className="review-buyer">{rev.buyerName}</span>
                <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Yorum içeriği */}
              <p className="review-text">{rev.review}</p>
            </div>
          ))}

          {hasMoreReviews && (
            <button onClick={() => loadMoreReviews()} className="modal-button" disabled={loadingReviews}>
              {loadingReviews ? "Loading..." : "Load More"}
            </button>
          )}
          {!hasMoreReviews && reviews.length === 0 && (
            <p>No reviews found.</p>
          )}
        </div>
      )}
      {showDMModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Send a Message to {user.name}</h3>
            <textarea
              rows="5"
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
              placeholder="Type your message..."
              className="dm-textarea"
            />
            <div className="modal-buttons">
              <button className="modal-button" onClick={sendMessage}>Send</button>
              <button className="modal-button cancel" onClick={() => setShowDMModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserPage;
