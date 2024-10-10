import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const SkillDistribution = ({ userSkills }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!Array.isArray(userSkills) || userSkills.length === 0) return;

    const data = userSkills.reduce((acc, skill) => {
      if (skill && skill.category) {
        const category = acc.find(item => item.name === skill.category);
        if (category) {
          category.value++;
        } else {
          acc.push({ name: skill.category, value: 1 });
        }
      }
      return acc;
    }, []);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const seriesData = data.map(item => parseFloat(((item.value / total) * 100).toFixed(1)));
    const labels = data.map(item => item.name);

    setSeries(seriesData);

    setChartOptions({
      chart: {
        height: 420,
        width: "100%",
        type: "pie",
      },
      labels: labels,
      colors: ["#1C64F2", "#16BDCA", "#9061F9", "#FCD34D", "#EF4444"],
      stroke: {
        colors: ["white"],
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -25
          }
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          const label = opts.w.globals.labels[opts.seriesIndex];
          return label ? `${label} - ${val.toFixed(1)}%` : '';
        },
        style: {
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
        },
        dropShadow: {
          enabled: true,
        }
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      tooltip: {
        y: {
          formatter: function (value) {
            return value ? value.toFixed(1) + "%" : 'N/A';
          },
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      },
    });
  }, [userSkills]);

  if (!Array.isArray(userSkills) || userSkills.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Distribution</h2>
        <p>No skill data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Distribution</h2>
      {series.length > 0 ? (
        <ReactApexChart options={chartOptions} series={series} type="pie" height={420} />
      ) : (
        <p>No valid skill categories found.</p>
      )}
    </div>
  );
};

export default SkillDistribution;