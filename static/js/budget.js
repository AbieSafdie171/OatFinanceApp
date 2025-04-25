/*------------------------------------------------------------*/
// ADD EXPENSE MODAL

// Grab modal elements
const modal = document.getElementById("expenseModal");
const openModalBtn = document.querySelector(".add-expense-btn");
const closeModalBtn = document.querySelector(".close");
const expenseForm = document.getElementById("expenseForm");

// Open modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close modal when X is clicked
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when user clicks outside the modal
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Handle form submission
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
      } else {
        alert("There was an error submitting your expense.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to submit expense.");
    });
});
/*------------------------------------------------------------*/














