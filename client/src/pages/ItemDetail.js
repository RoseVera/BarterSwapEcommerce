import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/ItemDetail.css';
import axios from 'axios';
import noImage from '../assets/no_image.png';
import coin from '../assets/coin.png';
import shop from '../assets/shop.png';

import useUserStore from '../components/UserStore';
import { toast } from 'react-toastify';

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
            toast.warning("You must be logged in to purchase.");
            return;
        }

        if (user.id === item.User.id) {
            toast.warning("You cannot purchase your own item.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:5000/api/items/${item.id}/purchase`,
                {},
                { withCredentials: true }
            );
            toast.success(res.data.message); // "Purchase successful"
            navigate('/');
        } catch (err) {
            if (err.response && err.response.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("An error occurred during purchase.");
            }
        }
    };

    const handlePlaceBid = async () => {
        if (!user) {
            toast.warning("You must be logged in to place a bid.");
            return;
        }

        if (user.id === item.User.id) {
            toast.warning("You cannot bid on your own item.");
            return;
        }

        const numericBid = parseInt(bidAmount, 10);

        if (isNaN(numericBid)) {
            toast.warning("Please enter a valid number.");
            return;
        }

        if (numericBid <= item.current_price) {
            toast.warning(`Your bid must be greater than the current price (${item.current_price}).`);
            return;
        }
        if(numericBid>user.balance){
             toast.warning("Bid amount is higher than your balance.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:5000/api/items/${item.id}/bid`,
                { bidAmount: numericBid },
                { withCredentials: true }
            );

            toast.success(res.data.message); // "Bid placed successfully"
            setItem(prev => ({ ...prev, current_price: numericBid })); // update 
            setBidAmount(''); // clear input

        } catch (err) {
            if (err.response?.data?.message) {
                toast.error(`Error: ${err.response.data.message}`);
            } else {
                toast.error("An error occurred while placing bid.");
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
