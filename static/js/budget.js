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

                for (const [category, amounts] of Object.entries(data)) {
                    const categoryDiv = document.querySelector(`.category.${category}`);
                    if (!categoryDiv) continue;

                    const table = categoryDiv.querySelector("table");
                    if (!table) continue;

                    const rows = table.querySelectorAll("tr");

                    if (category === "food") {
                        // For food, you need to update both Groceries and Out
                        let groceriesTotal = amounts.groceries || 0;
                        let outTotal = amounts.out || 0;

                        // Update Groceries row
                        const groceriesRow = rows[0];  // Assuming Groceries is the first row
                        if (groceriesRow) {
                            groceriesRow.cells[1].textContent = `$${groceriesTotal.toFixed(2)}`;
                        }

                        // Update Out row
                        const outRow = rows[1];  // Assuming Out is the second row
                        if (outRow) {
                            outRow.cells[1].textContent = `$${outTotal.toFixed(2)}`;
                        }

                        // Update Total row
                        const totalRow = rows[2];  // Assuming Total is the third row
                        if (totalRow) {
                            const total = groceriesTotal + outTotal;
                            totalRow.cells[1].textContent = `$${total.toFixed(2)}`;
                        }
                    } else if (category == "transportation"){

                        let insuranceTotal = amounts.insurance || 0;
                        let gasTotal = amounts.gas || 0;
                        let otherTotal = amounts.other || 0;

                        // Update insurance row
                        const insuranceRow = rows[0]; 
                        if (insuranceRow) {
                            insuranceRow.cells[1].textContent = `$${insuranceTotal.toFixed(2)}`;
                        }

                        // Update gas row
                        const gasRow = rows[1];  // Assuming Out is the second row
                        if (gasRow) {
                            gasRow.cells[1].textContent = `$${gasTotal.toFixed(2)}`;
                        }

                        // Update gas row
                        const otherRow = rows[2];  // Assuming Out is the second row
                        if (otherRow) {
                            otherRow.cells[1].textContent = `$${otherTotal.toFixed(2)}`;
                        }

                        // Update Total row
                        const totalRow = rows[3];  // Assuming Total is the third row
                        if (totalRow) {
                            const total = insuranceTotal + gasTotal + otherTotal;
                            totalRow.cells[1].textContent = `$${total.toFixed(2)}`;
                        }
                    } 
                    else {
                        // For other categories, update the total as before
                        const baseRow = rows[0];  // Assuming Total is the second row
                        const totalRow = rows[1];  // Assuming Total is the second row
                        if (totalRow) {
                            totalRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
                            baseRow.cells[1].textContent = `$${amounts.toFixed(2)}`;
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

// ADD SUBCATEGORIES DROPDOWN
document.addEventListener('DOMContentLoaded', function() {
  const categorySelect = document.getElementById('category');
  const typeContainerFood = document.getElementById('typeContainerFood');
  const typeContainerTrans = document.getElementById('typeContainerTrans');
  
  // Listen for changes in the category select dropdown
  categorySelect.addEventListener('change', function() {
    const selectedCategory = categorySelect.value;

    // Show or hide the "Type" dropdown based on the selected category
    if (selectedCategory === 'food') {
      // Show the Type dropdown if 'food' is selected
      typeContainerFood.style.display = 'block';
      typeContainerTrans.style.display = 'none';
    } else if (selectedCategory === 'transportation') {

      typeContainerTrans.style.display = 'block';
      typeContainerFood.style.display = 'none';
    } 
    else {
      // Hide the Type dropdown for other categories
      typeContainerFood.style.display = 'none';
      typeContainerTrans.style.display = 'none';
    }
  });
});









