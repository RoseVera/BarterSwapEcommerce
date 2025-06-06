import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../style/Admin.css';


const Transactions = () => {
  const [month, setMonth] = useState('');
  const [type, setType] = useState('purchase');
  const [transactions, setTransactions] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (reset = false) => {
    const res = await axios.get('http://localhost:5000/api/admin/transactions', {
      params: {
        month,
        type,
        cursor: reset ? null : cursor,
      },
    });

    const data = res.data;
    if (reset) {
      setTransactions(data.transactions);
    } else {
      setTransactions(prev => [...prev, ...data.transactions]);
    }
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
  };

  const exportCSV = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/transactions/export', {
      params: { month, type },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    if (month) fetchTransactions(true);
  }, [month, type]);

  return (
    <div className="transaction-container">
      <div className="filter-bar">
        <input className="toggle-sold-button" type="month" value={month} onChange={e => setMonth(e.target.value)} />
        <select className="toggle-sold-button" value={type} onChange={e => setType(e.target.value)}>
          <option value="purchase">PURCHASE</option>
          <option value="bonus">BONUS</option>
          <option value="reward">REWARD</option>
        </select>
        <button className="toggle-sold-button" onClick={() => fetchTransactions(true)}>Filter</button>
        <button className="toggle-sold-button" onClick={exportCSV}>Export CSV</button>
      </div>

      <table className="transaction-table">
        <thead>
          <tr>
            {type === 'purchase' ? (
              <>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Item</th>
                <th>Price</th>
                <th>Date</th>
              </>
            ) : (
              <>
                <th>User</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              {type === 'purchase' ? (
                <>
                  <td>{tx.buyerName}</td>
                  <td>{tx.sellerName}</td>
                  <td>{tx.itemName}</td>
                  <td>{tx.price}</td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                </>
              ) : (
                <>
                  <td>{tx.userName}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.type}</td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && <button className="toggle-sold-button" onClick={() => fetchTransactions()}>Load More</button>}
    </div>
  );
};

export default Transactions;
