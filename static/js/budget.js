document.addEventListener("DOMContentLoaded", function () {
    /*------------------------------------------------------------*/
    // GLOBALS
    const monthPicker = document.getElementById("monthPicker");
    const monthLabel = document.querySelector(".text-content-top h3 b");
    const modal = document.getElementById("expenseModal");
    const openModalBtn = document.querySelector(".add-expense-btn");
    const closeModalBtn = document.querySelector(".close");
    const expenseForm = document.getElementById("expenseForm");

    /*------------------------------------------------------------*/
    // FORMAT MONTH LABEL
    function formatMonthLabel(isoMonth) {
        const [year, month] = isoMonth.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    function updateMonthLabel(monthValue) {
        monthLabel.textContent = formatMonthLabel(monthValue);
    }

    /*------------------------------------------------------------*/
    // UPDATE BUDGET TABLE
    function updateBudgetTable(month) {
        fetch(`/get_budget_data?month=${month}`)
            .then(response => response.json())
            .then(data => {

                console.log(data);

                for (const [category, amount] of Object.entries(data)) {
                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");
                    for (let row of rows) {
                        const firstCellText = row.cells[0]?.textContent?.trim().toLowerCase();
                        if (firstCellText === "total") {
                            // Update the second <th> or <td> with the new amount
                            if (row.cells[1]) {
                                row.cells[1].textContent = `$${amount.toFixed(2)}`;
                            }
                            break;
                        }
                    }
                }
            })
            .catch(error => {
                console.error("Failed to load budget data:", error);
            });
    }


    /*------------------------------------------------------------*/
    // INIT MONTH PICKER VALUE IF EMPTY
    if (!monthPicker.value) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        monthPicker.value = `${year}-${month}`;
    }

    // Initial setup
    updateMonthLabel(monthPicker.value);
    updateBudgetTable(monthPicker.value);

    // Update on month change
    monthPicker.addEventListener("change", function () {
        updateMonthLabel(this.value);
        updateBudgetTable(this.value);
    });

    /*------------------------------------------------------------*/
    // ADD EXPENSE MODAL HANDLING
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

    /*------------------------------------------------------------*/
    // SUBMIT EXPENSE FORM
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
                    updateBudgetTable(monthPicker.value); // Refresh after adding
                } else {
                    alert("There was an error submitting your expense.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Failed to submit expense.");
            });
    });
});
