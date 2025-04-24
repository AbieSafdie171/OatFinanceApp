function calculateFederalTax(income) {
    const FEDERAL_TAX_BRACKETS = [
    { rate: 0.10, lowerBound: 0, upperBound: 11000 },
    { rate: 0.12, lowerBound: 11001, upperBound: 44725 },
    { rate: 0.22, lowerBound: 44726, upperBound: 95375 },
    { rate: 0.24, lowerBound: 95376, upperBound: 182100 },
    { rate: 0.32, lowerBound: 182101, upperBound: 231250 },
    { rate: 0.35, lowerBound: 231251, upperBound: 578125 },
    { rate: 0.37, lowerBound: 578126, upperBound: Infinity }
    ];
    let tax = 0;
    const standardDeduction = 13850;
    income -= standardDeduction;

    for (const bracket of FEDERAL_TAX_BRACKETS) {
        if (income > bracket.lowerBound) {
            const taxableAmount = Math.min(income - bracket.lowerBound, bracket.upperBound - bracket.lowerBound);
            tax += taxableAmount * bracket.rate;
        }
    }

    return tax;
}
function socialSecurityTax(income) {
    let taxableIncome = (income - 13850);

    if (taxableIncome > 0){
        if (taxableIncome > 168600){
            return (168600 * 0.062);
        } else {
            return (taxableIncome * 0.062);
        }
    } else {
        return 0;
    }
}


function medicareTax(income) {
    const taxableIncome = income - 13850;
    if (income >= 13850){
        return (taxableIncome * 0.0145);
    } else {
        return 0;
    }
}

function stateTax(income){
    const CALIFORNIA_TAX_BRACKETS = [
    { rate: 0.01, lowerBound: 0, upperBound: 10412 },
    { rate: 0.02, lowerBound: 10413, upperBound: 24684 },
    { rate: 0.04, lowerBound: 24685, upperBound: 38959 },
    { rate: 0.06, lowerBound: 38960, upperBound: 54081 },
    { rate: 0.08, lowerBound: 54082, upperBound: 68350 },
    { rate: 0.093, lowerBound: 68351, upperBound: 349137 },
    { rate: 0.103, lowerBound: 349138, upperBound: 418961 },
    { rate: 0.113, lowerBound: 418962, upperBound: 698271 },
    { rate: 0.123, lowerBound: 698272, upperBound: Infinity },
    ];
    let tax = 0;
    const stateStandardDeduction = 5363;
    income -= stateStandardDeduction;
    for (const bracket of CALIFORNIA_TAX_BRACKETS) {
        if (income > bracket.lowerBound) {
            const taxableAmount = Math.min(income - bracket.lowerBound, bracket.upperBound - bracket.lowerBound);
            tax += taxableAmount * bracket.rate;
        }
    }

    return tax;
}

function totalFederalTax(income) {
    return calculateFederalTax(income) + socialSecurityTax(income) + medicareTax(income);
}

// var tax_ctx = document.getElementById('taxChart').getContext('2d');
// if (typeof(taxChart === 'undefined')){
// var taxChart;
// }


document.addEventListener('DOMContentLoaded', () => {


    if (window.location.pathname === '/tax_calculator'){

        const tax_ctx = document.getElementById('taxChart').getContext('2d');

        if (typeof(taxChart) === 'undefined') {
            var taxChart;
        }


        if (taxChart) {
          taxChart.destroy();
        }


        // Initialize chart

        taxChart = new Chart(tax_ctx, {
        type: 'pie',
        data: {
            labels: ['Net Income', 'Federal Tax', 'Social Security Tax', 'Medicare Tax', 'State Tax'],
            datasets: [{
                label: 'Tax Distribution',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(255, 0, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 0, 86, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return '$' + tooltipItem.raw.toLocaleString();
                        }
                    }
                }
            }
        }
        });

        // Update chart based on user input
        function updatePieChart() {
        const incomeInput = document.getElementById('income');
        const income = parseFloat(incomeInput.value) || 0;

        const federalTax = calculateFederalTax(income);
        const socialSecurity = socialSecurityTax(income);
        const medicare = medicareTax(income);
        const state = stateTax(income);
        const netIncome = income - federalTax - socialSecurity - medicare - state;

        taxChart.data.datasets[0].data = [netIncome, federalTax, socialSecurity, medicare, state];
        taxChart.update();

        document.getElementById('fed_income_tax').textContent = '$' + federalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('social_security_tax').textContent = '$' + socialSecurity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('medicare_tax').textContent = '$' + medicare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('state_income_tax').textContent = '$' + state.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('net_income_value').textContent = '$' + netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (income != 0){
        let percent = ((federalTax + socialSecurity + medicare + state) / income) * 100;
        document.getElementById('tax_percent').textContent = percent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        }

            // Event listeners for input changes
            document.getElementById('income').addEventListener('input', updatePieChart);
            document.getElementById('state').addEventListener('change', updatePieChart);

            updatePieChart();
    }

});


