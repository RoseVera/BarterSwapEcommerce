import React, { useState, useEffect } from "react";
import '../style/Home.css';
import { useNavigate } from 'react-router-dom';
import auctionIcon from '../assets/auction.png';
import noImage from '../assets/no_image.png';
import coin from '../assets/coin.png';

function Home() {
    const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    is_bid: "", category: "", condition: "", min_price: "", max_price: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch("http://localhost:5000/api/latest-items")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams({
      page: currentPage,
      limit: 15,
      ...appliedFilters
    });

    fetch(`http://localhost:5000/api/filtered-items?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items);
        setTotalPages(data.totalPages);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [appliedFilters, currentPage]);

  const handleShowResults = () => {
    setCurrentPage(1); // sayfa başa dönsün
    setAppliedFilters({ ...filters });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="home-container">
      <input className="search-bar" placeholder="Search items..." disabled />
      <div className="content-wrapper">

        <div className="filter-menu">
          <h3>Filters</h3>
          <select
            className="filter-input"
            value={filters.is_bid}
            onChange={(e) => setFilters({ ...filters, is_bid: e.target.value })}
          >
            <option value="">All</option>
            <option value="true">Auction</option>
            <option value="false">Direct Sale</option>
          </select>

          <select
            className="filter-input"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Category</option>
            <option value="BOOK">Book</option>
            <option value="CLOTHING">Clothing</option>
            <option value="SHOES">Shoe</option>
            <option value="TEXTILE">Textile</option>
            <option value="STATIONERY">Stationery</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="TOYS">Toys</option>
            <option value="SPORT">Sport</option>
            <option value="BEAUTY">Beauty</option>
            <option value="ART">Art</option>
            <option value="MUSIC">Music</option>
            <option value="FURNITURE">Furniture</option>
            <option value="JEWELRY">Jewelry</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="filter-input"
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}>
            <option value="">All Conditions</option>
            <option value="NEW">New</option>
            <option value="LIKE NEW">Like New</option>
            <option value="GOOD">Good</option>
            <option value="ACCEPTABLE">Acceptable</option>
            <option value="BAD">Bad</option>

          </select>

          <input
            className="filter-input"
            type="number"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
          />

          <input
            className="filter-input"
            type="number"
            placeholder="Max Price"
            value={filters.max_price}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          />

          <button className="show-button" onClick={handleShowResults}>
            Show Results
          </button>
          <button className="show-button"onClick={() => window.location.reload()}>
            Clean Filters
          </button>
        </div>


        <div className="item-grid">
          {Array.isArray(items) && items.map(item => (
            <div key={item.id} className="item-card" onClick={() => navigate(`/item/${item.id}`)} style={{ cursor: 'pointer' }}>
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
                      style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                    />
                    {item.starting_price}
                  </p>
                  <p>
                    Current:{" "}
                    <img
                      src={coin}
                      alt="coin"
                      style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                    />
                    {item.current_price}
                  </p>
                </>
              ) : (
                <p>
                  Price:{" "}
                  <img
                    src={coin}
                    alt="coin"
                    style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                  />
                  {item.starting_price}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            &larr;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={page === currentPage ? "active-page" : ""}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
