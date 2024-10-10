import React, { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ReactApexChart = lazy(() => import('react-apexcharts'));

const RadialChart = ({ data }) => {
  const chartOptions = useMemo(() => ({
    series: data.map(item => item.percentage),
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
    chart: {
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total',
            formatter: function (w) {
              return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
            }
          }
        }
      },
    },
    labels: data.map(item => item.name),
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
  }), [data]);

  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <ReactApexChart options={chartOptions} series={chartOptions.series} type="radialBar" height={350} />
    </Suspense>
  );
};

RadialChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
  })).isRequired,
};

const ExchangeStatistics = ({ exchanges, loading }) => {
  const stats = useMemo(() => {
    if (!exchanges || exchanges.length === 0) return null;

    const statusCounts = exchanges.reduce((acc, exchange) => {
      acc[exchange.status] = (acc[exchange.status] || 0) + 1;
      return acc;
    }, {});

    const total = exchanges.length;
    const accepted = statusCounts.accepted || 0;
    const pending = statusCounts.pending || 0;
    const completed = statusCounts.completed || 0;
    const cancelled = statusCounts.cancelled || 0;

    return {
      total,
      accepted,
      pending,
      completed,
      cancelled,
    };
  }, [exchanges]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Accepted', value: stats.accepted, percentage: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0 },
      { name: 'Pending', value: stats.pending, percentage: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0 },
      { name: 'Completed', value: stats.completed, percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0 },
      { name: 'Cancelled', value: stats.cancelled, percentage: stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0 },
    ];
  }, [stats]);

  if (loading) {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Exchange Statistics</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </motion.div>
    );
  }

  if (!stats || chartData.length === 0) {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Exchange Statistics</h2>
        <p>No exchange data available.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Exchange Statistics</h2>
      <div className="mb-6">
        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        <p className="text-sm text-gray-600">Total Exchanges</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xl font-semibold text-green-600">{stats.accepted}</p>
          <p className="text-sm text-gray-600">Accepted</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-blue-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-yellow-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-red-600">{stats.cancelled}</p>
          <p className="text-sm text-gray-600">Cancelled</p>
        </div>
      </div>
      <RadialChart data={chartData} />
    </motion.div>
  );
};

ExchangeStatistics.propTypes = {
  exchanges: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.string.isRequired,
  })),
  loading: PropTypes.bool.isRequired,
};

export default ExchangeStatistics;