import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import useUserStore from "../../components/UserStore";
import coin from '../../assets/coin.png';
import whiteStar from '../../assets/whiteStar.png';
import yellowStar from '../../assets/yellowStar.png';
import { toast } from "react-toastify";

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [reviews, setReviews] = useState({});
  const { user } = useUserStore();
  const [cursor, setCursor] = useState(null); // null = first page
  const [hasMore, setHasMore] = useState(true);
  const didFetch = useRef(false);
  const userId = user.id;
  const navigate = useNavigate();

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items/purchased-items`, {
        params: { userId, cursor }
      });
      const newPurchases = res.data.purchases;
      console.log(res.data.purchases)
      setPurchases(prev => [...prev, ...newPurchases]);
      const reviewState = {};
      newPurchases.forEach(p => {
        reviewState[p.transaction_id] = {
          text: p.review || "",
          rating: p.rating || 0,
          existing: !!p.review,
          show: false
        };
      })
      setReviews(prev => ({ ...prev, ...reviewState }));
      setCursor(res.data.nextCursor);
      setHasMore(!!res.data.nextCursor);
    } catch (err) {
      console.error("Error fetching purchases", err);
    }
  };

  useEffect(() => {
    if (!didFetch.current) {
      fetchPurchases();
      didFetch.current = true;
    }
  }, []);

  const handleReviewChange = (id, field, value) => {
    setReviews(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleStarClick = (id, value) => {
    setReviews(prev => ({
      ...prev,
      [id]: { ...prev[id], rating: value }
    }));
  };

  const submitReview = async (transaction_id) => {
    const { text, rating, existing } = reviews[transaction_id] || {};
    if (!rating) return toast.warning("Rating is required");

    const url = `http://localhost:5000/api/reviews${existing ? `/${transaction_id}` : ''}`;
    const method = existing ? 'put' : 'post';

    try {
      await axios[method](url, {
        transaction_id,
        review: text,
        rating,
      });
      toast.success(existing ? "Review updated!" : "Review submitted!");
      setReviews(prev => ({
        ...prev,
        [transaction_id]: { ...prev[transaction_id], existing: true }
      }));
    } catch (err) {
      console.error("Review submit error", err);
    }
  };

  const deleteReview = async (transaction_id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/reviews/${transaction_id}`);
      toast.success("Review deleted!");

      setReviews(prev => ({
        ...prev,
        [transaction_id]: {
          text: "",
          rating: 0,
          existing: false,
          show: false
        }
      }));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <div className="p-4">
      <div className="item-list">
        {purchases.map(p => (
          <div key={p.transaction_id} className="item-card">
            <div>{p.title}</div>
            <button className="seller-link"
              onClick={() => navigate(`/user/${p.seller_id}`)}
            > Seller {p.seller_name}</button>

            <div style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}>{new Date(p.createdAt).toLocaleDateString()}</div>

            <div> <img
              src={coin}
              alt="coin"
              style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
            />{p.price}</div>
      

            <button
              onClick={() =>
                handleReviewChange(p.transaction_id, "show", !reviews[p.transaction_id]?.show)
              }
              className="modal-button"
            >
              {p.review ? "Update Review" : "Make Review"}
            </button>

            {reviews[p.transaction_id]?.show && (
              <div className="mt-2 space-y-2">
                <textarea
                  className="w-full border p-2 rounded"
                  maxLength={65535}
                  placeholder="Write your review..."
                 value={reviews[p.transaction_id]?.text || ""}
                  onChange={(e) => handleReviewChange(p.transaction_id, "text", e.target.value)}
                />
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <img
                      key={n}
                      src={(reviews[p.transaction_id]?.rating || 0) >= n ? yellowStar : whiteStar}
                      alt="star"
                      onClick={() => handleStarClick(p.transaction_id, n)}
                      style={{ width: "34px", height: "34px", cursor: "pointer", marginRight: "4px" }}
                    />
                  ))}
                  <span style={{ marginLeft: "8px" }}>{reviews[p.transaction_id]?.rating || 0}/5</span>
                </div>

                <button
                  onClick={() => submitReview(p.transaction_id)}
                  className="modal-button"
                >
                  Save Review
                </button>
                {p.review && (
                  <button
                    onClick={() => deleteReview(p.transaction_id)}
                    className="modal-button bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete Review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button onClick={fetchPurchases} className="modal-button">
            Load More
          </button>
        </div>
      )}

    </div>
  );
}

export default PurchaseHistory;
