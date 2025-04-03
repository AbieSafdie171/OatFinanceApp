


if (typeof moneyChart === 'undefined') {
    var moneyChart; // Use var here to avoid redeclaration issues
}
var ctx = document.getElementById('moneyChart').getContext('2d');

function createChart() {
const labels = ["8/2024"];
const data = [14000];
if (moneyChart) {
  moneyChart.destroy();
}
moneyChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Net Worth',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '$'
        }
      }
    }
  }
});
}

document.addEventListener('turbo:load', function() {
if (window.location.pathname === '/') {
  createChart(); // Call the function to create or update the chart
}
});
