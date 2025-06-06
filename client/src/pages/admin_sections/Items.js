import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../../style/Admin.css';

function Items() {
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [showSold, setShowSold] = useState(false);
    const [soldRatio, setSoldRatio] = useState(0);
    const [conditionStats, setConditionStats] = useState({});
    const [categoryStats, setCategoryStats] = useState({});

    useEffect(() => {
        fetchInitialItems();
        fetchSoldRatio();
        fetchConditionStats();
        fetchCategoryStats();
    }, [showSold]);

    const fetchInitialItems = () => {
        const activeParam = showSold ? 'false' : 'true';
        fetch(`http://localhost:5000/api/admin/items?limit=100&active=${activeParam}`)
            .then(res => res.json())
            .then(data => {
                setItems(data.items);
                setTotalItems(data.total);
                if (data.items.length > 0) {
                    setCursor(data.items[data.items.length - 1].id);
                }
                setHasMore(data.hasMore);
            });
    };

    const loadMoreItems = () => {
        const activeParam = showSold ? 'false' : 'true';
        fetch(`http://localhost:5000/api/admin/items?limit=100&cursor=${cursor}&active=${activeParam}`)
            .then(res => res.json())
            .then(data => {
                setItems(prev => [...prev, ...data.items]);
                if (data.items.length > 0) {
                    setCursor(data.items[data.items.length - 1].id);
                }
                setHasMore(data.hasMore);
            });
    };

    const fetchSoldRatio = () => {
        fetch('http://localhost:5000/api/admin/items/sold-ratio')
            .then(res => res.json())
            .then(data => {
                setSoldRatio(data.ratio);
            });
    };

    const fetchConditionStats = () => {
        const activeParam = showSold ? 'false' : 'true';
        fetch(`http://localhost:5000/api/admin/items/condition-stats?active=${activeParam}`)
            .then(res => res.json())
            .then(data => {
                setConditionStats(data);
            });
    };

    const fetchCategoryStats = () => {
        const activeParam = showSold ? 'false' : 'true';
        fetch(`http://localhost:5000/api/admin/items/category-stats?active=${activeParam}`)
            .then(res => res.json())
            .then(data => {
                setCategoryStats(data);
            });
    };

    const toggleShowSold = () => {
        setShowSold(prev => !prev);
        setCursor(null);
        setItems([]);
    };

    const conditionChartData = {
        labels: Object.keys(conditionStats),
        datasets: [
            {
                label: 'Number of Items',
                data: Object.values(conditionStats),
                backgroundColor: 'rgba(75,192,192,0.6)'
            }
        ]
    };

    const categoryChartData = {
        labels: Object.keys(categoryStats),
        datasets: [
            {
                label: 'Number of Items',
                data: Object.values(categoryStats),
                backgroundColor: 'rgba(153,102,255,0.6)'
            }
        ]
    };

    return (
        <div className="items-user">
            <div className="top-bar">
                <button className="toggle-sold-button" onClick={toggleShowSold}>
                    {showSold ? 'On Sale Items ' : 'Sold Items'}
                </button>
            </div>

            <h2>Total Item: {totalItems}</h2>
            <h3>Sold Item Rate: {soldRatio * 100}%</h3>

            <div className="charts">

                <div className="chart">
                    <h3>Number of Items by Category</h3>
                    <Bar data={categoryChartData} />
                </div>

                <div className="chart">
                    <h3>Number of Items by Conditon</h3>
                    <Bar data={conditionChartData} />
                </div>
            </div>

            <div className="transaction-table">
                {items.map(item => (
                    <div key={item.id} className="item-row">
                        <a href={`/item/${item.id}`}>{item.title}</a>
                    </div>
                ))}
            </div>
            {hasMore && (
                <button className="load-more-button" onClick={loadMoreItems}>
                    Load More
                </button>
            )}
        </div>
    );
}

export default Items;
