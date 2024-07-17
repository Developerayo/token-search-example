import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const chartHover = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "lightgrey",
          padding: "5px",
          border: "1px solid gray",
        }}
      >
        <p>{label}</p>
        <p>
          Price-Change:{" "}
          <span style={{ color: payload[0].value >= 0 ? "green" : "red" }}>
            {payload[0].value?.toFixed(2)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

function tokenDetails() {
  const [search, setSearch] = useState("");
  const [tokenDetails, setTokenDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearching = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setTokenDetails(null);

      try {
        let response;
        if (search.startsWith("0x")) {
          response = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${search}`,
          );
        } else {
          response = await axios.get(
            `https://api.dexscreener.com/latest/dex/search/?q=${search}`,
          );
        }

        if (response.data.pairs && response.data.pairs.length > 0) {
          setTokenDetails(response.data.pairs[0]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [search],
  );

  const change = tokenDetails
    ? [
        { name: "5m", value: tokenDetails.priceChange?.m5 },
        { name: "1h", value: tokenDetails.priceChange?.h1 },
        { name: "6h", value: tokenDetails.priceChange?.h6 },
        { name: "24h", value: tokenDetails.priceChange?.h24 },
      ]
    : [];

  const renderTokenDetails = () => {
    if (!tokenDetails) return null;

    return (
      <div
        style={{
          padding: "10px",
          border: "1px solid red",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
          {tokenDetails.baseToken.name} ({tokenDetails.baseToken.symbol})
        </h2>
        <p>Chain: {tokenDetails.chainId}</p>
        <div>
          <p>Price: ${parseFloat(tokenDetails.priceUsd).toFixed(6)}</p>
          <p>24h Volume: ${tokenDetails.volume?.h24.toLocaleString()}</p>
          <p>Liquidity: ${tokenDetails.liquidity?.usd.toLocaleString()}</p>
          <p>Fully Diluted Valuation: ${tokenDetails.fdv?.toLocaleString()}</p>
        </div>

        <h3>Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={change}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<chartHover />} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
        <div>
          <p>5m Change: {tokenDetails.priceChange?.m5?.toFixed(2)}%</p>
          <p>1h Change: {tokenDetails.priceChange?.h1?.toFixed(2)}%</p>
          <p>6h Change: {tokenDetails.priceChange?.h6?.toFixed(2)}%</p>
          <p>24h Change: {tokenDetails.priceChange?.h24?.toFixed(2)}%</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "20px",
          borderBlockColor: "grey",
        }}
      >
        Search Token
      </h1>
      <form onSubmit={handleSearching} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "5px",
            marginRight: "5px",
            border: "1px solid gray",
          }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: "5px" }}>
          Search
        </button>
      </form>

      {isLoading && <p>Loading...</p>}
      {renderTokenDetails()}
      {!isLoading && !tokenDetails && <p>address or token ticker</p>}
    </div>
  );
}

export default tokenDetails;
