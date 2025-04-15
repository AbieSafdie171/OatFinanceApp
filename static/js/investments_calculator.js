document.addEventListener("DOMContentLoaded", function () {
  const amountInput = document.getElementById("money");
  const rateInput = document.getElementById("return");
  const timeInput = document.getElementById("time");
  const returnSpan = document.getElementById("return-value");
  const netReturnSpan = document.getElementById("net-return-value");

  const inputFields = [amountInput, rateInput, timeInput];

  inputFields.forEach(input => {
    input.addEventListener("input", calculateReturn);
  });

  function calculateReturn() {
    const principal = parseFloat(amountInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseFloat(timeInput.value);

    if (isNaN(principal) || isNaN(rate) || isNaN(years)) {
      returnSpan.textContent = "";
      netReturnSpan.textContent = "";
      return;
    }

    let amount = principal;

    if (years < 1) {
      // Apply a single interest period at the proportional rate
      const fractionalRate = (rate / 100) * years;
      amount *= 1 + fractionalRate;
    } else {
      const wholeYears = Math.floor(years);
      const remainder = years - wholeYears;

      // Compound annually
      for (let i = 0; i < wholeYears; i++) {
        amount *= 1 + (rate / 100);
      }

      // Apply fractional compounding just once for the remaining partial year
      if (remainder > 0) {
        amount *= 1 + ((rate / 100) * remainder);
      }
    }

    const returnVal = amount.toFixed(2);
    const netReturnVal = (amount - principal).toFixed(2);

    returnSpan.textContent = `$${returnVal}`;
    returnSpan.style.color = "green";

    netReturnSpan.textContent = `$${netReturnVal}`;
    netReturnSpan.style.color = "green";
  }
});
