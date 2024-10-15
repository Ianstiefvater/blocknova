import React, { useState, useEffect } from 'react';
import Navbar from "../common/Navbar";
import Footer from "../views/footer";
import "../common/buttons/button.css"; 
import "../../index.css"



const Transactions = () => {
  const [interval, setInterval] = useState('');
  const [countdown, setCountdown] = useState(60); 
  const [transactions, setTransactions] = useState([]);
  const [isCronStarted, setIsCronStarted] = useState(false); 
  const BACKEND_API_URL = process.env.VITE_BACKEND_API_URL || 'http://localhost:5000';

  

  const handleIntervalChange = (e) => {
    setInterval(e.target.value);
  };

  const handleCronSubmit = (e) => {
    e.preventDefault();  
    fetch(`${BACKEND_API_URL}/api/set-cron-interval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: interval }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Cron job set to run every ${interval} minutes`);
      setIsCronStarted(true);
      fetchTransactions();
      setCountdown(60);
    })
    .catch(error => {
      console.error('Error setting cron job:', error);
    });
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/get-transactions`);
      const data = await response.json();
      setTransactions(data.transactions);  
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  useEffect(() => {
    fetchTransactions(); 
  }, []);

  
  
  

  // Effect for the countdown
  useEffect(() => {
    if (isCronStarted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCronStarted && countdown === 0) {
      setCountdown(60); 
      fetchTransactions(); 
    }
  }, [countdown, isCronStarted]);

  return (
    <div id='cronjob'>
      <Navbar />

      <div className="container mx-auto pt-28 p-4">
        <h1 className="text-4xl font-bold mb-6 text-white text-center"> 
          Transactions
        </h1>

        <div className="flex flex-col gap-4 mb-8">
          <label className="text-2xl font-light text-center" style={{ color: 'rgba(164, 164, 164, 1)' }}>
            Enter the interval in minutes
            <input
              type="number"
              value={interval}
              onChange={handleIntervalChange}
              className="mt-2 p-2 border border-gray-300 w-full custom-input"
              style={{ outline: 'none', borderRadius: '0' }}
              min="0"

            />
          </label>
          <button
            onClick={handleCronSubmit}
            className="clipButton"
            style={{width: "150px" }} 
          >
            Set Interval
          </button>
        </div>

        {isCronStarted && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-white">
              Your transactions will be refreshed in <span className="text-green-600">{countdown}</span> seconds.
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate table-fixed" style={{ borderSpacing: '0 0' }}>
            <thead>
              <tr style={{ backgroundColor: '#3a3a3a' }}>
                <th className="py-2 px-4 border-b border-gray-600 text-white text-left">Hash</th>
                <th className="py-2 px-4 border-b border-gray-600 text-white text-left">Amount</th>
                <th className="py-2 px-4 border-b border-gray-600 text-white text-left">Sender</th>
                <th className="py-2 px-4 border-b border-gray-600 text-white text-left">To</th>
                <th className="py-2 px-4 border-b border-gray-600 text-white text-left">Block Height</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <tr key={index} style={{ backgroundColor: '#2e2e2e' }}>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{tx.hash}</td>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{tx.value} BNB</td>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{tx.from}</td>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{tx.to}</td>
                    <td className="py-2 px-4 border-b border-gray-600 text-white">{tx.blockHeight}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 px-4 border-b border-gray-600 text-white" colSpan="5">
                    No transactions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer className="mt-8"/>
    </div>
  );
};

export default Transactions;

