import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const AnalyticsChart = ({ data }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSeries([
        {
          name: 'Exchanges',
          color: '#3B82F6',
          data: data.map(item => ({ x: item.name, y: item.exchanges }))
        },
        {
          name: 'Hours',
          color: '#10B981',
          data: data.map(item => ({ x: item.name, y: item.hours }))
        }
      ]);

      setChartOptions({
        chart: {
          type: 'bar',
          height: 350,
          fontFamily: 'Inter, sans-serif',
          toolbar: {
            show: false
          },
          background: '#FFFFFF'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '70%',
            borderRadiusApplication: 'end',
            borderRadius: 4,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val.toFixed(0)
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ["#304758"]
          }
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: data.map(item => item.name),
          labels: {
            style: {
              colors: '#64748B',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            }
          },
          axisBorder: {
            show: true,
            color: '#E2E8F0'
          },
          axisTicks: {
            show: true,
            color: '#E2E8F0'
          }
        },
        yaxis: [
          {
            title: {
              text: 'Exchanges',
              style: {
                color: '#3B82F6'
              }
            },
            labels: {
              style: {
                colors: '#64748B'
              }
            }
          },
          {
            opposite: true,
            title: {
              text: 'Hours',
              style: {
                color: '#10B981'
              }
            },
            labels: {
              style: {
                colors: '#64748B'
              }
            }
          }
        ],
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(0)
            }
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        grid: {
          borderColor: '#E2E8F0',
          strokeDashArray: 4,
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          markers: {
            radius: 12
          }
        }
      });
    }
  }, [data]);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Exchange Analytics</h2>
      <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
    </div>
  );
};

export default AnalyticsChart;