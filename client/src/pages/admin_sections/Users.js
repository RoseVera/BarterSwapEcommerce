import React, { useEffect, useState } from "react";
import "../../style/Admin.css";
import coin from '../../assets/coin.png';
import { useNavigate } from "react-router-dom";

function Users() {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialUsers();
    }, []);
    const fetchInitialUsers = () => {
        const deletedParam = showDeleted ? "&deleted=true" : "";
        fetch(`http://localhost:5000/api/admin/users?limit=100${deletedParam}`)
            .then(res => res.json())
            .then(data => {
                setUsers(data.users);
                setTotalUsers(data.total);
                if (data.users.length > 0) {
                    setCursor(data.users[data.users.length - 1].id);
                }
                setHasMore(data.hasMore);
            });
    };

    const loadMoreUsers = () => {
        const deletedParam = showDeleted ? "&deleted=true" : "";
        fetch(`http://localhost:5000/api/admin/users?limit=100&cursor=${cursor}${deletedParam}`)
            .then(res => res.json())
            .then(data => {
                setUsers(prev => [...prev, ...data.users]);
                if (data.users.length > 0) {
                    setCursor(data.users[data.users.length - 1].id);
                }
                setHasMore(data.hasMore);
            });
    };
    const toggleShowDeleted = () => {
        setShowDeleted(prev => !prev);
        setCursor(null);
        setUsers([]);
    };

    useEffect(() => {
        fetchInitialUsers();
    }, [showDeleted]);


    const userActivation = (id, showDeleted) => {

        fetch(`http://localhost:5000/api/admin/users/${id}/${showDeleted}`, { method: "PATCH" })
            .then(res => {
                if (res.ok) {
                    setUsers(users.filter(user => user.id !== id));
                    setTotalUsers(totalUsers - 1);
                }
            });
    };



    return (
        <div className="users-container">
            <div className="top-bar">
                <button className="toggle-sold-button" onClick={toggleShowDeleted}>
                    {showDeleted ? "Show All" : "Show Deactivated Users"}
                </button>
            </div>

            <h2>Total Users: {totalUsers}</h2>
            <div className="user-list">
                {users.map(user => (
                    <div key={user.id} className="user-row">
                        <div>
                            <button className="load-more-button"
                                onClick={() => navigate(`/user/${user.id}`)}
                            >  {user.name}</button>
                        </div>
                        <div>{user.email}</div>
                        <div>{user.phone}</div>
                        <div><img
                            src={coin}
                            alt="coin"
                            className="coin-icon"
                        /> {user.balance}</div>
                        <button className="delete-button" onClick={() => userActivation(user.id, showDeleted)}>
                            {showDeleted ? "Activate" : "Deactivate"}
                        </button>                    </div>
                ))}
            </div>
            {hasMore && (
                <button className="load-more-button" onClick={loadMoreUsers}>
                    Load More
                </button>
            )}
        </div>
    );
}

export default Users;
