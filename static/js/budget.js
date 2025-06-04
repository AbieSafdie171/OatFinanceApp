document.addEventListener("DOMContentLoaded", function () {
    /*------------------------------------------------------------*/
    // GLOBALS
    const monthPicker = document.getElementById("monthPicker");
    const currentMonthBtn = document.getElementById("current-btn");
    const avgMonthBtn = document.getElementById("avg-btn");
    const realAvgMonthBtn = document.getElementById("real-avg-mnth-btn");
    const monthLabel = document.querySelector(".text-content-top h3 b");
    const modal = document.getElementById("expenseModal");
    const openModalBtn = document.querySelector(".add-expense-btn");
    const closeModalBtn = document.querySelector(".close");
    const expenseForm = document.getElementById("expenseForm");
    const yearPicker = document.getElementById("yearPicker");
    const yearLabel = document.querySelector(".text-content-top-expenses h3 b");
    const categorySelect = document.getElementById('category');
    const typeContainerFood = document.getElementById('typeContainerFood');
    const typeContainerTrans = document.getElementById('typeContainerTrans');


    const ledgerBtn = document.querySelector(".ledger-btn");
    const ledgerModal = document.getElementById("ledgerModal");
    const ledgerClose = document.querySelector(".ledger-close");
    const ledgerMonthPicker = document.getElementById("ledgerMonth");
    const ledgerCategorySelect = document.getElementById("ledgerCategory");
    const loadLedgerDataBtn = document.getElementById("loadLedgerData");
    const ledgerTableHead = document.getElementById("ledgerTableHead");
    const ledgerTableBody = document.getElementById("ledgerTableBody");

    /*------------------------------------------------------------*/
    // FORMATTERS
    function formatMonthLabel(isoMonth) {
        const [year, month] = isoMonth.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    function updateMonthLabel(monthValue) {
        monthLabel.textContent = formatMonthLabel(monthValue);
    }

    function updateMonthLabelYear(year){
        monthLabel.textContent = year;
    }

    function updateMonthLabelAvg(year){
        monthLabel.textContent = `Average Month ${year}`;
    }

    function formatYearLabel(year) {
        return year;
    }

    function updateYearLabel(yearValue) {
        yearLabel.textContent = formatYearLabel(yearValue);
    }

    /*------------------------------------------------------------*/
    // BUDGET TABLE UPDATER
    function updateBudgetTable(month) {
        fetch(`/get_budget_data?month=${month}`)
            .then(response => response.json())
            .then(data => {

                console.log(month);

                let expensesTotal = 0.0;
                let expensesTotalNoHousing = 0.0;
                let income = 0.0;

                for (const [category, amounts] of Object.entries(data)) {
                    if (category === "income") {
                        income = amounts;
                        continue;
                    }

                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");

                    if (category === "food") {
                        let groceriesTotal = amounts.groceries || 0;
                        let outTotal = amounts.out || 0;

                        if (rows[0]) rows[0].cells[1].textContent = `$${groceriesTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${outTotal.toFixed(2)}`;
                        if (rows[2]) {
                            const total = groceriesTotal + outTotal;
                            rows[2].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else if (category === "transportation") {
                        let insuranceTotal = amounts.insurance || 0;
                        let gasTotal = amounts.gas || 0;
                        let otherTotal = amounts.other || 0;

                        if (rows[0]) rows[0].cells[1].textContent = `$${insuranceTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${gasTotal.toFixed(2)}`;
                        if (rows[2]) rows[2].cells[1].textContent = `$${otherTotal.toFixed(2)}`;
                        if (rows[3]) {
                            const total = insuranceTotal + gasTotal + otherTotal;
                            rows[3].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else {
                        const baseRow = rows[0];
                        const totalRow = rows[1];
                        if (totalRow) {
                            totalRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
                            baseRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
                            if (category !== "housing") {
                                expensesTotalNoHousing += amounts;
                            }
                            expensesTotal += amounts;
                        }
                    }
                }

                const expenseNoHousing = document.getElementById("expense-value-nohouse");
                const savingsValue = document.getElementById("savings-value");

                let expensesTotalNoHousingPercent = (expensesTotalNoHousing / income) * 100;
                expensesTotalNoHousingPercent = expensesTotalNoHousingPercent.toFixed(2);

                if (income > 0){
                    expenseNoHousing.textContent = `$${expensesTotalNoHousing.toFixed(2)} (${expensesTotalNoHousingPercent}% of income)`;
                    expenseNoHousing.style.color = "#ff0000";
                } else{
                    expenseNoHousing.textContent = `$${expensesTotalNoHousing.toFixed(2)}`;
                    expenseNoHousing.style.color = "#ff0000";
                }



                let savings = income - expensesTotal;
                if (savings < 0){
                    savings = 0;
                }

                let savings_percent = (savings / income) * 100;

                savings_percent = savings_percent.toFixed(2);

                if (income > 0){
                    savingsValue.textContent = `$${savings.toFixed(2)} (${savings_percent}% of income)`;
                    savingsValue.style.color = savings <= 0 ? "#ff0000" : "green";
                } else{
                    savingsValue.textContent = `$${savings.toFixed(2)}`;
                    savingsValue.style.color = "#ff0000";
                }




                // Update percentages
                for (const [category] of Object.entries(data)) {
                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");
                    let totalRow, percentRow;

                    if (category === "food") {
                        totalRow = rows[2];
                        percentRow = rows[3];
                    } else if (category === "transportation") {
                        totalRow = rows[3];
                        percentRow = rows[4];
                    } else {
                        totalRow = rows[1];
                        percentRow = rows[2];
                    }

                    if (percentRow && totalRow) {
                        let amountStr = totalRow.cells[1].textContent.replace(/<\/?th>/g, '').replace('$', '');
                        let amount = parseFloat(amountStr);
                        let percent = (amount / expensesTotal) * 100;

                        percentRow.cells[1].textContent = isNaN(percent) ? `0%` : `${percent.toFixed(2)}%`;
                    }
                }
            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }

    function updateExpensesTable(year) {
        fetch(`/get_expense_data?year=${year}`)
            .then(response => response.json())
            .then(data => {

                // Array of month names to display in the table
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                // Select all rows from both tables in the expenses category
                const expenseTables = document.querySelectorAll('.expense-category.expenses table tbody');
                const allRows = [...expenseTables[0].rows, ...expenseTables[1].rows];

                let total = 0;

                let num_months = 0;

                // Loop through each month and update the table
                for (let month = 1; month <= 12; month++) {
                    const amount = data[month] || 0.0;  // Default to 0.0 if no data
                    total += amount;

                    if (amount > 0){
                      num_months += 1;
                    }

                    const formattedAmount = `$${amount.toFixed(2)}`;

                    // Find the row corresponding to the current month (January to December)
                    if (allRows[month - 1]) {
                        // Update the second column (amount column) for the month row
                        allRows[month - 1].cells[1].textContent = formattedAmount;
                    }
                }

                const average = total / num_months;

                // Update the total and average fields in the second table
                const totalRow = expenseTables[1].rows[expenseTables[1].rows.length - 2];
                const avgRow = expenseTables[1].rows[expenseTables[1].rows.length - 1];
                totalRow.cells[1].textContent = `$${total.toFixed(2)}`;
                avgRow.cells[1].textContent = `$${average.toFixed(2)}`;
            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }



    function updateIncomeTable(year) {
        fetch(`/get_income_data?year=${year}`)
            .then(response => response.json())
            .then(data => {

                // console.log(data);

                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                // Select all income table rows
                const incomeTables = document.querySelectorAll('.expense-category.income table tbody');
                const allRows = [...incomeTables[0].rows, ...incomeTables[1].rows];

                let total = 0;

                let num_months = 0

                for (let i = 0; i < 12; i++) {
                    const month = i + 1;
                    const amount = data[month] || 0.0;
                    total += amount;

                    if (amount > 0){
                      num_months += 1;
                    }

                    const formattedAmount = `$${amount.toFixed(2)}`;
                    if (allRows[i]) {
                        allRows[i].cells[1].textContent = formattedAmount;
                    }
                }

                const average = total / num_months;

                // Update total and average rows (last 2 rows in second table)
                const totalRow = incomeTables[1].rows[incomeTables[1].rows.length - 2];
                const avgRow = incomeTables[1].rows[incomeTables[1].rows.length - 1];
                totalRow.cells[1].textContent = `$${total.toFixed(2)}`;
                avgRow.cells[1].textContent = `$${average.toFixed(2)}`;
            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }

    function updateBudgetTableYear(year) {
        fetch(`/get_year_data?year=${year}`)
            .then(response => response.json())
            .then(data => {

                // console.log(data);
                let expensesTotal = 0.0;
                let expensesTotalNoHousing = 0.0;
                let income = 0.0;

                for (const [category, amounts] of Object.entries(data)) {
                    if (category === "income") {
                        income = amounts;
                        continue;
                    }

                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");

                    if (category === "food") {
                        let groceriesTotal = amounts.groceries || 0;
                        let outTotal = amounts.out || 0;

                        if (rows[0]) rows[0].cells[1].textContent = `$${groceriesTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${outTotal.toFixed(2)}`;
                        if (rows[2]) {
                            const total = groceriesTotal + outTotal;
                            rows[2].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else if (category === "transportation") {
                        let insuranceTotal = amounts.insurance || 0;
                        let gasTotal = amounts.gas || 0;
                        let otherTotal = amounts.other || 0;

                        if (rows[0]) rows[0].cells[1].textContent = `$${insuranceTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${gasTotal.toFixed(2)}`;
                        if (rows[2]) rows[2].cells[1].textContent = `$${otherTotal.toFixed(2)}`;
                        if (rows[3]) {
                            const total = insuranceTotal + gasTotal + otherTotal;
                            rows[3].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else {
                        const baseRow = rows[0];
                        const totalRow = rows[1];
                        if (totalRow) {
                            totalRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
                            baseRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
                            if (category !== "housing") {
                                expensesTotalNoHousing += amounts;
                            }
                            expensesTotal += amounts;
                        }
                    }
                }

                const expenseNoHousing = document.getElementById("expense-value-nohouse");
                const savingsValue = document.getElementById("savings-value");

                // let expensesTotalNoHousingPercent = (expensesTotalNoHousing / income) * 100;
                // expensesTotalNoHousingPercent = expensesTotalNoHousingPercent.toFixed(2);
                expenseNoHousing.textContent = `$${expensesTotalNoHousing.toFixed(2)}`;
                expenseNoHousing.style.color = "#ff0000";

                const savings = income - expensesTotal;
                // let savings_percent = (savings / income) * 100
                // savings_percent = savings_percent.toFixed(2);
                savingsValue.textContent = `$${savings.toFixed(2)}`;
                savingsValue.style.color = savings < 0 ? "#ff0000" : "green";

                // Update percentages
                for (const [category] of Object.entries(data)) {
                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");
                    let totalRow, percentRow;

                    if (category === "food") {
                        totalRow = rows[2];
                        percentRow = rows[3];
                    } else if (category === "transportation") {
                        totalRow = rows[3];
                        percentRow = rows[4];
                    } else {
                        totalRow = rows[1];
                        percentRow = rows[2];
                    }

                    if (percentRow && totalRow) {
                        let amountStr = totalRow.cells[1].textContent.replace(/<\/?th>/g, '').replace('$', '');
                        let amount = parseFloat(amountStr);
                        let percent = (amount / expensesTotal) * 100;

                        percentRow.cells[1].textContent = isNaN(percent) ? `0%` : `${percent.toFixed(2)}%`;
                    }
                }

            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }

    function updateBudgetTableAvg(year) {
        fetch(`/get_avg_month?year=${year}`)
            .then(response => response.json())
            .then(data => {

                // console.log(data);



                let currentMonth = new Date();      // NOTE MONTHS ARE 0-INDEXED. I.E. JAN IS 0, FEB IS 1...

                currentMonth = currentMonth.getMonth() + 1;

                let expensesTotal = 0.0;
                let expensesTotalNoHousing = 0.0;
                let income = 0.0;

                for (const [category, amounts] of Object.entries(data)) {
                    if (category === "income") {
                        income = amounts / currentMonth;
                        continue;
                    }

                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");

                    if (category === "food") {
                        let groceriesTotal = (amounts.groceries || 0) / currentMonth;
                        let outTotal = (amounts.out || 0) / currentMonth;

                        if (rows[0]) rows[0].cells[1].textContent = `$${groceriesTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${outTotal.toFixed(2)}`;
                        if (rows[2]) {
                            const total = groceriesTotal + outTotal;
                            rows[2].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else if (category === "transportation") {
                        let insuranceTotal = (amounts.insurance || 0) / currentMonth;
                        let gasTotal = (amounts.gas || 0) / currentMonth;
                        let otherTotal = (amounts.other || 0) / currentMonth;

                        if (rows[0]) rows[0].cells[1].textContent = `$${insuranceTotal.toFixed(2)}`;
                        if (rows[1]) rows[1].cells[1].textContent = `$${gasTotal.toFixed(2)}`;
                        if (rows[2]) rows[2].cells[1].textContent = `$${otherTotal.toFixed(2)}`;
                        if (rows[3]) {
                            const total = insuranceTotal + gasTotal + otherTotal;
                            rows[3].cells[1].textContent = `$${total.toFixed(2)}`;
                            expensesTotal += total;
                            expensesTotalNoHousing += total;
                        }
                    } else {
                        const baseRow = rows[0];
                        const totalRow = rows[1];
                        let amount = amounts / currentMonth;
                        if (totalRow) {
                            totalRow.cells[1].textContent = `$${amount.toFixed(2)}`;
                            baseRow.cells[1].textContent = `$${amount.toFixed(2)}`;
                            if (category !== "housing") {
                                expensesTotalNoHousing += amount;
                            }
                            expensesTotal += amount;
                        }
                    }
                }

                const expenseNoHousing = document.getElementById("expense-value-nohouse");
                const savingsValue = document.getElementById("savings-value");

                let expensesTotalNoHousingPercent = (expensesTotalNoHousing / income) * 100;
                expensesTotalNoHousingPercent = expensesTotalNoHousingPercent.toFixed(2);
                expenseNoHousing.textContent = `$${expensesTotalNoHousing.toFixed(2)} (${expensesTotalNoHousingPercent}% of avg income)`;
                expenseNoHousing.style.color = "#ff0000";

                const savings = income - expensesTotal;
                let savings_percent = (savings / income) * 100
                savings_percent = savings_percent.toFixed(2);
                savingsValue.textContent = `$${savings.toFixed(2)} (${savings_percent}% of average income)`;
                savingsValue.style.color = savings < 0 ? "#ff0000" : "green";

                // Update percentages
                for (const [category] of Object.entries(data)) {
                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");
                    let totalRow, percentRow;

                    if (category === "food") {
                        totalRow = rows[2];
                        percentRow = rows[3];
                    } else if (category === "transportation") {
                        totalRow = rows[3];
                        percentRow = rows[4];
                    } else {
                        totalRow = rows[1];
                        percentRow = rows[2];
                    }

                    if (percentRow && totalRow) {
                        let amountStr = totalRow.cells[1].textContent.replace(/<\/?th>/g, '').replace('$', '');
                        let amount = parseFloat(amountStr);
                        let percent = (amount / expensesTotal) * 100;

                        percentRow.cells[1].textContent = isNaN(percent) ? `0%` : `${percent.toFixed(2)}%`;
                    }
                }

            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }

    /*------------------------------------------------------------*/
    // INITIALIZATION
    if (!monthPicker.value) {
        const now = new Date();
        monthPicker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!yearPicker.value) {
        const now = new Date();
        yearPicker.value = now.getFullYear();
    }

    updateMonthLabel(monthPicker.value);
    updateBudgetTable(monthPicker.value);
    updateYearLabel(yearPicker.value);
    updateIncomeTable(yearPicker.value);
    updateExpensesTable(yearPicker.value)

    /*------------------------------------------------------------*/
    // EVENT LISTENERS
    monthPicker.addEventListener("change", function () {
        updateMonthLabel(this.value);
        updateBudgetTable(this.value);
    });


    currentMonthBtn.addEventListener("click", function (){
        const now = new Date();
        monthPicker.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        updateMonthLabel(monthPicker.value);
        updateBudgetTable(monthPicker.value);

    });

    avgMonthBtn.addEventListener("click", function (){

        const [year, month] = monthPicker.value.split("-");
        updateMonthLabelYear(year);
        updateBudgetTableYear(year);

    });

    realAvgMonthBtn.addEventListener("click", function (){

        const [year, month] = monthPicker.value.split("-");
        updateMonthLabelAvg(year);
        updateBudgetTableAvg(year);

    });


    // Open modal on button click
    ledgerBtn.addEventListener("click", () => {
        ledgerModal.style.display = "block";
    });

    // Close modal on (x) click
    ledgerClose.addEventListener("click", () => {
        ledgerModal.style.display = "none";
    });


    loadLedgerDataBtn.addEventListener("click", () => {
        const category = ledgerCategorySelect.value;
        const month = ledgerMonthPicker.value;

        if (!category || !month) {
            alert("Please select both a category and a month.");
            return;
        }

        fetch(`/get_category_data?category=${category}&month=${month}`)
            .then(res => res.json())
            .then(data => {
                ledgerTableHead.innerHTML = "";
                ledgerTableBody.innerHTML = "";

                if (!data || data.length === 0) {
                    ledgerTableBody.innerHTML = `<tr><td colspan="4">No data available for this selection.</td></tr>`;
                    return;
                }

                const headers = Object.keys(data[0]);
                headers.forEach(header => {
                    const th = document.createElement("th");
                    th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
                    ledgerTableHead.appendChild(th);
                });

                data.forEach(row => {
                    const tr = document.createElement("tr");
                    headers.forEach(key => {
                        const td = document.createElement("td");

                        if (key === "date") {
                            // Log the raw date value for debugging
                            console.log("Raw Date Value:", row[key]);

                            let isoDate = row[key];

                            // Manually split the date string to remove the day of the week and time zone
                            const dateParts = isoDate.split(", ")[1]; // This will give '01 Jan 2025 00:00:00 GMT'
                            
                            if (dateParts) {
                                const [day, month, year] = dateParts.split(" "); // Split '01 Jan 2025' into ['01', 'Jan', '2025']

                                // Format the date as "Month Day" (e.g., "Jan 1")
                                const formattedDate = `${month} ${parseInt(day)}`;

                                td.textContent = formattedDate; // e.g., "Jan 1"
                            } else {
                                td.textContent = "Invalid Date"; // Fallback if date is not valid
                            }
                        } else {
                            td.textContent = row[key];
                        }

                        tr.appendChild(td);
                    });

                    ledgerTableBody.appendChild(tr);
                });



            })
        .catch(err => {
                console.error("Error loading ledger data:", err);
                alert("Failed to load ledger data.");
            });
    });



    yearPicker.addEventListener("change", function () {
        updateYearLabel(this.value);
        updateIncomeTable(yearPicker.value);
        updateExpensesTable(yearPicker.value)
    });

    openModalBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        } else if (event.target === ledgerModal) {
            ledgerModal.style.display = "none";
        }
    });

    expenseForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(expenseForm);

        fetch("/add_expense", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    expenseForm.reset();
                    modal.style.display = "none";
                    updateBudgetTable(monthPicker.value);
                    updateIncomeTable(yearPicker.value);
                    updateExpensesTable(yearPicker.value)
                } else {
                    alert("There was an error submitting your expense.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Failed to submit expense.");
            });
    });

    categorySelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;

        typeContainerFood.style.display = selectedCategory === 'food' ? 'block' : 'none';
        typeContainerTrans.style.display = selectedCategory === 'transportation' ? 'block' : 'none';
    });
});
