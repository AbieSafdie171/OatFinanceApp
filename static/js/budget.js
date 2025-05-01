document.addEventListener("DOMContentLoaded", function () {
    /*------------------------------------------------------------*/
    // GLOBALS
    const monthPicker = document.getElementById("monthPicker");
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

                expenseNoHousing.textContent = `$${expensesTotalNoHousing.toFixed(2)}`;
                expenseNoHousing.style.color = "#ff0000";

                const savings = income - expensesTotal;
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

    /*------------------------------------------------------------*/
    // EVENT LISTENERS
    monthPicker.addEventListener("change", function () {
        updateMonthLabel(this.value);
        updateBudgetTable(this.value);
    });

    yearPicker.addEventListener("change", function () {
        updateYearLabel(this.value);
        // updateYearTable
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
                    // updateYearTable
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
