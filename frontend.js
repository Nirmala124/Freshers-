import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/transactions?month=${selectedMonth}&search=${searchQuery}&page=${currentPage}&perPage=${perPage}`);
        setTransactions(response.data.transactions);
        setTotalSaleAmount(response.data.statistics.totalSaleAmount);
        setTotalSoldItems(response.data.statistics.totalSoldItems);
        setTotalNotSoldItems(response.data.statistics.totalNotSoldItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedMonth, searchQuery, currentPage]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset page when search is applied
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <h1>Product Transactions</h1>

      <div>
        <select value={selectedMonth} onChange={handleMonthChange}>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          {/* ... other months */}
        </select>

        <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search transactions" />
      </div>

      <h2>Statistics</h2>
      <p>Total Sale Amount: {totalSaleAmount}</p>
      <p>Total Sold Items: {totalSoldItems}</p>
      <p>Total Not Sold Items: {totalNotSoldItems}</p>

      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product Title</th>
            <th>Product Description</th>
            <th>Price</th>
            <th>Is Sold</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.dateOfSale.toLocaleDateString()}</td>
              <td>{transaction.productTitle}</td>
              <td>{transaction.productDescription}</td>
              <td>{transaction.price}</td>
              <td>{transaction.isSold ? 'Yes' : 'No'}</td>
              <td>{transaction.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>

      <h2>Bar Chart</h2>
	function BarChart({ month }) {
  		const [barChartData, setBarChartData] = useState([]);
		useEffect(() => {
    		const fetchData = async () => {
    		try {
        	const response = await axios.get(`/api/bar-chart?month=${month}`);
        	setBarChartData(response.data);
      		} 
		catch (error) {
       		console.error('Error fetching bar chart data:', error);
     	 }
    	};

    fetchData();   

  }, [month]);

  }

<BarChart month={selectedMonth} />
     



      <h2>Pie Chart</h2>
      <PieChart pieChartData={pieChartData} />
    </div>
  );
}

export default App;