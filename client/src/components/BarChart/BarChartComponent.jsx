/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


export default function BarChartComponent({ data }) {

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip  
          cursor={false}
          content={<CustomTooltip />} 
        />
        <Legend />
        <Bar 
          dataKey="WPM" 
          fill="#8b5cf6" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-label">
        <span>WPM: {Math.round(data.WPM)}</span>
        <p className="text-label">{data.segment}</p>
      </div>
    );
  }

  return null;
}