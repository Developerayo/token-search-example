import React, { useState, useCallback, useEffect } from "react";
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

interface ChartHoverProps {
  active?: boolean;
  payload?: { value: string }[];
  label?: number;
}

const ChartHover: React.FC<ChartHoverProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "lightgrey",
          padding: "5px",
          border: "1px solid gray",
        }}
      >
        <p>Block Number: {label}</p>
        <p>
          Avg Gas Price:{" "}
          <span>{(parseFloat(payload[0].value) / 1e9).toFixed(2)} Gwei</span>
        </p>
      </div>
    );
  }
  return null;
};

interface GasDataPoint {
  blockNumber: number;
  avgGasPrice: string;
}

const TokenDetails: React.FC = () => {
  const [gasData, setGasData] = useState<GasDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchGasData = useCallback(async () => {
    setIsLoading(true);
    const response = await axios.get('https://iai-donation-be.onrender.com/detector/get-average-gas-fee');
    if (response.data.success && response.data.data) {
      setGasData(response.data.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchGasData();
  }, [fetchGasData]);

  const renderGasChart = () => {
    if (gasData.length === 0) return null;

    return (
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={gasData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="blockNumber" />
            <YAxis 
              tickFormatter={(value) => `${(parseFloat(value) / 1e9).toFixed(2)}`}
              label={{ value: 'Gas Price (Gwei)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<ChartHover />} />
            <Line type="monotone" dataKey="avgGasPrice" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
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
        Gas Price
      </h1>
      {renderGasChart()}
      {!isLoading && gasData.length === 0 && <p>check endpoint</p>}
    </div>
  );
};

export default TokenDetails;
