

/*------------------------------------------------------------*/

// ADD EXPENSE MODAL


const modal = document.getElementById("expenseModal");
const btn = document.querySelector(".add-expense-btn");
const span = document.querySelector(".close");

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("expenseForm").onsubmit = function(e) {
  e.preventDefault();
  // TODO: Handle form submission here
  alert("Expense submitted!");


  document.getElementById("expenseForm").reset();
  modal.style.display = "none";
  }

/*------------------------------------------------------------*/


