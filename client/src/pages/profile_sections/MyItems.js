import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../components/UserStore";
import axios from "axios";
import auctionIcon from "../../assets/auction.png"; // ikon yolunu doğru ver
import coin from '../../assets/coin.png';
import { toast } from "react-toastify";

function MyItems() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleUpdateModal = () => setUpdateIsModalOpen(!isUpdateModalOpen);

  const cleanForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      starting_price: "",
      condition: "",
      image: "",
      is_bid: false,
    });
    setIsModalOpen(true);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    starting_price: "",
    condition: "",
    image: "",
    is_bid: false,
  });

  const openUpdateModal = (item) => {
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      starting_price: item.starting_price,
      condition: item.condition,
      image: item.image,
      is_bid: item.is_bid,
    });
    setUpdateIsModalOpen(true);
  };

  const fetchItems = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);

    try {
      let url = `http://localhost:5000/api/items/myItems?user_id=${user.id}&limit=10`;
      if (filter === "bid") url += "&is_bid=true";
      else if (filter === "non-bid") url += "&is_bid=false";
      if (!reset && cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

      const res = await axios.get(url);

      if (reset) {
        setItems(res.data.items);
      } else {
        setItems(prev => [...prev, ...res.data.items]);
      }

      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setCursor(null);
      setHasMore(true);
      fetchItems(true);
    }
  }, [filter, user?.id]);

  // Update Form Data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(formData)
      const response = await axios.post("http://localhost:5000/api/items", {
        ...formData,
        user_id: user.id,
      });

      if (response.status === 201) {
        toast.success("Item created successfully!");
        //toggleModal();
      }
    } catch (err) {
      toast.error("Error creating item");
      console.error(err);
    }
  };

  //Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("update data", formData)
      const response = await axios.put(
        `http://localhost:5000/api/items/${formData.id}`,
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          starting_price: formData.starting_price,
          condition: formData.condition,
          image: formData.image,
          is_bid: formData.is_bid,
          user_id: user.id,
        }
      );

      if (response.status === 200) {
        toast.success("Item updated successfully!");
        //setUpdateIsModalOpen(false);
        //const refreshed = await axios.get(`http://localhost:5000/api/items?user_id=${user.id}`);
        //setItems(refreshed.data);
      }
    } catch (err) {
      toast.error("Error updating item");
      console.error(err);
    }
  };

  //Delete
  const handleDelete = async () => {
    console.log(formData.id)
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/items/${formData.id}`);
        if (response.status === 200) {
          toast.success("Item deleted successfully.");
          // Refresh items list
          const refreshed = await axios.get(`http://localhost:5000/api/items?user_id=${user.id}`);
          setItems(refreshed.data);
          setUpdateIsModalOpen(false)
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        //toast.error("Failed to delete item.");
      }
    }
  };

  //Sell Item
  const handleSell = async (itemId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/bids/sell/${itemId}`);
      toast.success(response.data.message);

      // Satış sonrası listeyi yenile
      //const refreshed = await axios.get(`http://localhost:5000/api/items?user_id=${user.id}`);
      //setItems(refreshed.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error processing sale");
    }
  };

  return (
    <div className="item-page">

      {/*ADD ITEM */}
      <div className="left-panel">
        <button className="add-item-button" onClick={cleanForm}>
          + Add Item
        </button>
        <div >
          <button className="filter-buttons" onClick={() => setFilter("all")}>All</button>
          <button className="filter-buttons" onClick={() => setFilter("bid")}>Auction Items</button>
          <button className="filter-buttons" onClick={() => setFilter("non-bid")}>Fixed Price Items</button>
        </div>
      </div>

      {/*ITEM LIST */}
      <div className="item-list">
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card" style={{ position: "relative" }}>
              <button
                onClick={() => openUpdateModal(item)}
                className="modal-button"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                }}
              >
                Update Item
              </button>

              {item.is_bid && (
                <img
                  src={auctionIcon}
                  alt="Auction"
                  className="auction-icon"
                  style={{ width: "50px", position: "absolute", top: "10px", left: "10px" }}
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              {item.is_bid ? (
                <>
                  {item.current_price && (
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
                      <button
                        className="modal-button"
                        onClick={() => handleSell(item.id)}
                      >
                        Sell
                      </button>
                    </>
                  )}
                  {!item.current_price && (
                    <p>
                      Starting:{" "}
                      <img
                        src={coin}
                        alt="coin"
                        style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                      />
                      {item.starting_price}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    Price:{" "}
                    <img
                      src={coin}
                      alt="coin"
                      style={{ width: "20px", verticalAlign: "middle", marginRight: "5px", marginBottom: "4px" }}
                    />
                    {item.starting_price}
                  </p>

                </>
              )}
            </div>
          ))
        )}
      </div>


      {/* Load More */}
      {hasMore && (
        <div className="pagination">
          <button className="modal-button"onClick={() => fetchItems()} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/*MODALS */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={toggleModal}>
              &times;
            </span>
            <h2>Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <input
                  className="modal-input"
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>

                <textarea
                  placeholder="Description"
                  name="description"
                  className="modal-input"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div>
                <label>Category</label>
                <select
                  name="category"
                  className="modal-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
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
              </div>
              <div>
                <input
                  placeholder="Starting Price"
                  type="number"
                  className="modal-input"
                  name="starting_price"
                  value={formData.starting_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Condition</label>
                <select
                  placeholder="Starting Price"

                  name="condition"
                  className="modal-input"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="NEW">New</option>
                  <option value="LIKE NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                  <option value="BAD">Bad</option>
                </select>
              </div>
              <div>
                <input
                  className="modal-input"
                  type="text"
                  name="image"
                  placeholder="Image Url"
                  value={formData.image}
                  onChange={handleChange}

                />
              </div>
              <div>
                <label>Is this an auction?</label>
                <input
                  type="checkbox"
                  name="is_bid"
                  className="modal-input"
                  checked={formData.is_bid}
                  onChange={(e) =>
                    setFormData({ ...formData, is_bid: e.target.checked })
                  }
                />
              </div>
              <button className="modal-button" type="submit">Save</button>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={toggleUpdateModal}>
              &times;
            </span>
            <h2>Update Item</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div>
                <input
                  className="modal-input"
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>

                <textarea
                  placeholder="Description"
                  name="description"
                  className="modal-input"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div>
                <label>Category</label>
                <select
                  name="category"
                  className="modal-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
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
              </div>
              <div>
                <input
                  placeholder="Starting Price"
                  type="number"
                  className="modal-input"
                  name="starting_price"
                  value={formData.starting_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Condition</label>
                <select
                  placeholder="Starting Price"

                  name="condition"
                  className="modal-input"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="NEW">New</option>
                  <option value="LIKE NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                  <option value="BAD">Bad</option>
                </select>
              </div>
              <div>
                <input
                  className="modal-input"
                  type="text"
                  name="image"
                  placeholder="Image Url"
                  value={formData.image}
                  onChange={handleChange}

                />
              </div>
              <div>
                <label>Is this an auction?</label>
                <input
                  type="checkbox"
                  name="is_bid"
                  className="modal-input"
                  checked={formData.is_bid}
                  onChange={(e) =>
                    setFormData({ ...formData, is_bid: e.target.checked })
                  }
                />
              </div>
              <button className="modal-button" type="submit">Update</button>
            </form>
            <button

              onClick={() => handleDelete()}
              className="modal-button"
              style={{ backgroundColor: "red" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyItems;
