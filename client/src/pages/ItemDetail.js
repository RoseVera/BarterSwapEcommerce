import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileIcon from '../assets/user.png';
import '../style/ItemDetail.css';
import axios from 'axios';
import noImage from '../assets/no_image.png';
import coin from '../assets/coin.png';

function ItemDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const navigate = useNavigate();
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/${id}`);
                console.log(res.data)
                setItem(res.data);
            } catch (err) {
                console.error("Item fetch error:", err);
            }
        };
        fetchItem();
    }, [id]);


    if (!item) return <div>Loading...</div>;

    const handleBuy = () => {
        // satın alma işlemi
    };

    const handlePlaceBid = () => {
        // teklif verme işlemi
    };

    return (
        <div className="item-page">
            <button className="seller-header"
             onClick={() => navigate(`/user/${item.User.id}`)}
            >
                <span>Seller: {item.User.name}</span>
                <img
                    src={profileIcon}
                    alt="Seller Profile"
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
                                                  style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                                                />{item.starting_price}</p>
                            <p><strong>Current Price</strong> <img
                                                  src={coin}
                                                  alt="coin"
                                                  style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                                                />{item.current_price}</p>
                            <input
                                type="number"
                                placeholder="Enter your bid"
                                value={bidAmount}
                                onChange={e => setBidAmount(e.target.value)}
                            />
                            <button onClick={handlePlaceBid}>Place Bid</button>
                        </>
                    ) : (
                        <>
                            <p><strong>Price</strong> <img
                                                  src={coin}
                                                  alt="coin"
                                                  style={{ width: "22px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                                                />{item.starting_price}</p>
                            <button onClick={handleBuy}>Buy</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemDetail;
