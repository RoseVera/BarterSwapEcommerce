import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileIcon from '../assets/user.png';
import '../style/ItemDetail.css';
import axios from 'axios';
import noImage from '../assets/no_image.png';
import coin from '../assets/coin.png';
import shop from '../assets/shop.png';

import useUserStore from '../components/UserStore';

function ItemDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const navigate = useNavigate();
    const [bidAmount, setBidAmount] = useState('');
    const { user } = useUserStore();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/items/${id}`);
                console.log(res.data)
                setItem(res.data);
            } catch (err) {
                console.error("Item fetch error:", err);
            }
        };
        fetchItem();
    }, [id]);


    if (!item) return <div>Loading...</div>;


    const handleBuy = async () => {
        if (!user) {
            alert("You must be logged in to purchase.");
            return;
        }

        if (user.id === item.User.id) {
            alert("You cannot purchase your own item.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:5000/api/items/${item.id}/purchase`,
                {},
                { withCredentials: true } // JWT cookie varsa
            );
            alert(res.data.message); // "Purchase successful"
            navigate('/'); // veya satın alınanlar sayfası
        } catch (err) {
            if (err.response && err.response.data?.message) {
                alert(err.response.data.message);
            } else {
                alert("An error occurred during purchase.");
            }
        }
    };

    const handlePlaceBid = async () => {
        if (!user) {
            alert("You must be logged in to place a bid.");
            return;
        }

        if (user.id === item.User.id) {
            alert("You cannot bid on your own item.");
            return;
        }

        const numericBid = parseInt(bidAmount, 10);

        if (isNaN(numericBid)) {
            alert("Please enter a valid number.");
            return;
        }

        if (numericBid <= item.current_price) {
            alert(`Your bid must be greater than the current price (${item.current_price}).`);
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:5000/api/items/${item.id}/bid`,
                { bidAmount: numericBid },
                { withCredentials: true }
            );

            alert(res.data.message); // "Bid placed successfully"
            setItem(prev => ({ ...prev, current_price: numericBid })); // Anında güncelleme
            setBidAmount(''); // inputu temizle

        } catch (err) {
            if (err.response?.data?.message) {
                alert(`Error: ${err.response.data.message}`);
            } else {
                alert("An error occurred while placing bid.");
            }
        }
    };

    return (
        <div className="item-page">
            <button className="seller-header"
                onClick={() => navigate(`/user/${item.User.id}`)}
            >
                <span> {item.User.name}'s Shop</span>
                <img
                    src={shop}
                    alt="Seller Profile"
                    style={{ width: "47px", height: "47px", verticalAlign: "middle", marginLeft: "5px", marginBottom: "4px" }}
                    className="seller-icon"

                />
            </button>

            <div className="item-container">
                <div className="item-info">
                    <h2>{item.title}</h2>
                    <img
                        src={item.image ? item.image : noImage}
                        alt={item.title}
                        className="item-image"
                    />
                    <p>{item.description}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Condition:</strong> {item.condition}</p>
                </div>

                <div className="item-action">
                    {item.is_bid ? (
                        <>
                            <p><strong>Starting Price</strong> <img
                                src={coin}
                                alt="coin"
                                style={{ width: "20px", verticalAlign: "middle", marginLeft: "5px", marginBottom: "4px" }}
                            /><strong>{item.starting_price}</strong></p>
                            {item.current_price !== null && (
                                <p><strong>Current Price</strong> <img
                                    src={coin}
                                    alt="coin"
                                    style={{ width: "20px", verticalAlign: "middle", marginLeft: "5px", marginBottom: "4px" }}
                                /><strong>{item.current_price}</strong></p>
                            )}
                            <input
                                type="number"
                                className="login-input"
                                placeholder="Enter your bid"
                                value={bidAmount}
                                onChange={e => setBidAmount(e.target.value)}
                            />
                            <button onClick={handlePlaceBid}>Place Bid</button>
                        </>
                    ) : (
                        <>
                            <p> <img
                                src={coin}
                                alt="coin"
                                style={{ width: "22px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                            /><strong>{item.starting_price}</strong></p>
                            <button onClick={handleBuy}>Buy</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetail;
