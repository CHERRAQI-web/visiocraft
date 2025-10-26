// src/components/ProjectTrendChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Il est nécessaire d'enregistrer les composants de Chart.js que vous allez utiliser
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Données d'exemple pour le graphique (évolution des projets créés par mois)
const chartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Projects Created',
      data: [3, 5, 2, 8, 4, 6, 9], // Exemple de données
      borderColor: 'rgb(99, 102, 241)', // Couleur de la ligne (indigo)
      backgroundColor: 'rgba(99, 102, 241, 0.5)', // Couleur de fond de l'aire
      tension: 0.3, // Rend la ligne légèrement courbée
    },
  ],
};

// Options de configuration du graphique
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Project Creation Trend',
    },
  },
  scales: {
    y: {
      beginAtZero: true, // Fait commencer l'axe Y à 0
    },
  },
};

const ProjectTrendChart = () => {
  return <Line data={chartData} options={chartOptions} />;
};

export default ProjectTrendChart;