// Function to calculate the future value and principal
function calculateFutureValue(startingBalance, interestRate, years, contribution) {

    let principalData = [];
    let interestData = [];
    let totalData = [];
    let labels = [];
    let interest = 0;
    let principal = startingBalance;
    interestRate = interestRate / 100;

    principalData.push(principal);
    interestData.push(interest);
    totalData.push(principal + interest);
    labels.push(`Year 0`);

    if (years > 1000)
        return { principalData, interestData, totalData, labels, finalValue: totalData[years] };

    for (let i = 1; i <= years; i++) {
        const principal_interest = principal * interestRate;
        // console.log("Principal Interest: ", principal_interest);

        interest = interest + (interest * interestRate);
        interest += principal_interest;
        principal += contribution;

        principalData.push(principal);
        interestData.push(interest);
        totalData.push(principal + interest);
        labels.push(`${i}`);
    }

    return { principalData, interestData, totalData, labels, finalValue: totalData[years] };
}

// Function to update the chart and total balance
function updateChart() {
    const startingBalance = parseFloat(document.getElementById('starting_balance').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest_rate').value) || 0;
    const years = parseInt(document.getElementById('time_to_grow').value) || 0;
    const contribution = parseInt(document.getElementById('contribution_amount').value) || 0;

    const { principalData, interestData, totalData, labels, finalValue } = calculateFutureValue(startingBalance, interestRate, years, contribution);

    investmentChart.data.labels = labels;
    investmentChart.data.datasets[0].data = principalData;
    investmentChart.data.datasets[1].data = interestData;
    investmentChart.data.datasets[2].data = totalData;
    investmentChart.update();

    // Update the total balance amount
    var money = finalValue.toFixed(2);
    let decimal_portion = money.slice(-3);
    let c = 0;
    let final_representation = "";

    for (let i = (money.length - 4); i >= 0; i--) {
        if (c == 3) {
            final_representation = ',' + final_representation;
            c = 0;
        }
        c += 1;
        final_representation = money[i] + final_representation;
    }

    final_representation += decimal_portion;

    document.getElementById('balance-amount').textContent = '$' + final_representation;
}

// Initialize the chart
var interest_ctx = document.getElementById('investmentChart').getContext('2d');
if (typeof(investmentChart) === 'undefined'){
    var investmentChart;
}
if (investmentChart){
    investmentChart.destroy();
}
investmentChart = new Chart(interest_ctx, {
    type: 'line',
    data: {
        labels: [],  // Initially empty, will be filled with user input
        datasets: [
            {
                label: 'Principal Balance',
                data: [],  // Initially empty, will be filled with user input
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Interest Earned',
                data: [],  // Initially empty, will be filled with user input
                borderColor: 'rgba(0, 128, 0, 1)',
                backgroundColor: 'rgba(0, 128, 0, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Total Earned',
                data: [],  // Initially empty, will be filled with user input
                borderColor: 'rgba(0, 0, 0, 1)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();  // Format the Y-axis labels as currency
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    }
});

// Add event listeners to update the chart and total balance when input values change
document.getElementById('starting_balance').addEventListener('input', updateChart);
document.getElementById('interest_rate').addEventListener('input', updateChart);
document.getElementById('time_to_grow').addEventListener('input', updateChart);
document.getElementById('contribution_amount').addEventListener('input', updateChart);

// Initialize chart with default values
updateChart();
