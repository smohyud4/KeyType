/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './LineChartComponent.css';

function transformData(data) {

  if (data.length > 60) {
    return data.filter((_, index) => index % 4 === 0 || index === data.size-1);
  }

  if (data.length > 40) {
    return data.filter((_, index) => index % 3 === 0 || index === data.size-1);
  }

  if (data.length > 20) {
    return data.filter((_, index) => index % 2 === 0 || index === data.size-1);
  }

  return data;
}

function LineChartComponent({data}) {
 
  return (
    <ResponsiveContainer width="100%" height={350} minWidth={100}>
      <LineChart
        width={500}
        height={300}
        data={transformData(data)}
        margin={{ top: 20, right: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="WPM" stroke="#5f5fc4"/>
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartComponent;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='chart-label'>
        <p>{label} sec</p>
        <p>
          WPM 
          <span id='wpm'> {Math.round(payload[0].value)}</span>
        </p>
      </div>
    );
  }
};