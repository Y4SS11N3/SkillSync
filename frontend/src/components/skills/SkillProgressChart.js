import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const SkillProgressChart = ({ userSkills }) => {
  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const proficiencyData = userSkills.map(skill => ({
      x: skill.name,
      y: skill.proficiencyLevel
    }));

    const practiceTimeData = userSkills.map(skill => ({
      x: skill.name,
      y: skill.practiceTime
    }));

    setSeries([
      {
        name: 'Proficiency',
        color: '#4F46E5',
        data: proficiencyData
      },
      {
        name: 'Practice Time (hours)',
        color: '#10B981',
        data: practiceTimeData
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
          return val.toFixed(1)
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
        categories: userSkills.map(skill => skill.name),
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
            text: 'Proficiency',
            style: {
              color: '#4F46E5'
            }
          },
          labels: {
            style: {
              colors: '#64748B'
            },
            formatter: function(val) {
              return ['Good', 'Skilled', 'Experienced', 'Advanced', 'Expert'][Math.floor(val) - 1] || '';
            }
          },
          min: 1,
          max: 5,
          tickAmount: 5
        },
        {
          opposite: true,
          title: {
            text: 'Practice Time (hours)',
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
            return val.toFixed(1)
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
  }, [userSkills]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Progress</h2>
      <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
    </div>
  );
};

export default SkillProgressChart;