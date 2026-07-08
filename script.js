// ============================
// Global Variables
// ============================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;

let pieChart;
let barChart;

// DOM Elements
const expenseTable = document.getElementById("expenseTable");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseIndex = document.getElementById("expenseIndex");

const addExpenseBtn = document.getElementById("addExpense");

const budgetInput = document.getElementById("budget");
const saveBudgetBtn = document.getElementById("saveBudget");

const totalExpense = document.getElementById("totalExpense");
const averageExpense = document.getElementById("averageExpense");
const transactionCount = document.getElementById("transactionCount");

const budgetValue = document.getElementById("budgetValue");
const remainingBudget = document.getElementById("remainingBudget");

const progressBar = document.getElementById("progressBar");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");

// ============================
// Save Local Storage
// ============================

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function saveBudget() {
    localStorage.setItem("budget", budget);
}

// ============================
// Budget Button
// ============================

saveBudgetBtn.addEventListener("click", () => {

    budget = Number(budgetInput.value);

    if (budget < 0) budget = 0;

    saveBudget();

    updateSummary();

});

// ============================
// Add/Edit Expense
// ============================

addExpenseBtn.addEventListener("click", () => {

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || amount <= 0 || !date) {

        alert("Please fill all fields.");

        return;

    }

    const expense = {

        title,
        amount,
        category,
        date

    };

    if (expenseIndex.value === "") {

        expenses.push(expense);

    } else {

        expenses[expenseIndex.value] = expense;

        expenseIndex.value = "";

        addExpenseBtn.textContent = "Save Expense";

    }

    saveExpenses();

    clearForm();

    renderExpenses();

    updateSummary();

});

// ============================
// Render Expense Table
// ============================

function renderExpenses() {

    expenseTable.innerHTML = "";

    const keyword = searchInput.value.toLowerCase();

    const filter = filterCategory.value;

    const filtered = expenses.filter(expense => {

        const matchesTitle =
            expense.title.toLowerCase().includes(keyword);

        const matchesCategory =
            filter === "All" || expense.category === filter;

        return matchesTitle && matchesCategory;

    });

    if (filtered.length === 0) {

        expenseTable.innerHTML =
            `<tr>
                <td colspan="5" class="empty">
                    No Expenses Found
                </td>
            </tr>`;

        return;

    }

    filtered.forEach((expense) => {

        const actualIndex = expenses.indexOf(expense);

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${expense.title}</td>

            <td>₹${expense.amount}</td>

            <td>${expense.category}</td>

            <td>${expense.date}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editExpense(${actualIndex})">

                    Edit

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteExpense(${actualIndex})">

                    Delete

                </button>

            </td>

        `;

        expenseTable.appendChild(row);

    });

}

// ============================
// Delete Expense
// ============================

function deleteExpense(index) {

    if (!confirm("Delete this expense?")) return;

    expenses.splice(index, 1);

    saveExpenses();

    renderExpenses();

    updateSummary();

}

// ============================
// Edit Expense
// ============================

function editExpense(index) {

    const expense = expenses[index];

    titleInput.value = expense.title;

    amountInput.value = expense.amount;

    categoryInput.value = expense.category;

    dateInput.value = expense.date;

    expenseIndex.value = index;

    addExpenseBtn.textContent = "Update Expense";

}

// ============================
// Clear Form
// ============================

function clearForm() {

    titleInput.value = "";

    amountInput.value = "";

    categoryInput.selectedIndex = 0;

    dateInput.value = "";

}

// ============================
// Search & Filter
// ============================

searchInput.addEventListener("input", renderExpenses);

filterCategory.addEventListener("change", renderExpenses);

// ============================
// Update Summary
// ============================

function updateSummary() {

    let total = 0;

    expenses.forEach(expense => {
        total += Number(expense.amount);
    });

    totalExpense.textContent = total.toFixed(2);

    transactionCount.textContent = expenses.length;

    averageExpense.textContent =
        expenses.length === 0
            ? "0"
            : (total / expenses.length).toFixed(2);

    budgetValue.textContent = budget.toFixed(2);

    const remaining = budget - total;

    remainingBudget.textContent = remaining.toFixed(2);

    // Progress Bar

    let percent = 0;

    if (budget > 0) {
        percent = (total / budget) * 100;

        if (percent > 100)
            percent = 100;
    }

    progressBar.style.width = percent + "%";

    if (budget > 0 && total > budget) {

        progressBar.classList.add("over-budget");

        remainingBudget.classList.add("warning");

    }
    else {

        progressBar.classList.remove("over-budget");

        remainingBudget.classList.remove("warning");

    }

    updatePieChart();

    updateBarChart();

}

// ============================
// Pie Chart
// ============================

function updatePieChart() {

    const categories = {};

    expenses.forEach(expense => {

        if (!categories[expense.category]) {

            categories[expense.category] = 0;

        }

        categories[expense.category] += Number(expense.amount);

    });

    const labels = Object.keys(categories);

    const values = Object.values(categories);

    if (pieChart) {

        pieChart.destroy();

    }

    pieChart = new Chart(

        document.getElementById("pieChart"),

        {

            type: "pie",

            data: {

                labels: labels,

                datasets: [

                    {

                        data: values,

                        backgroundColor: [

                            "#3B82F6",
                            "#10B981",
                            "#F59E0B",
                            "#EF4444",
                            "#8B5CF6",
                            "#06B6D4",
                            "#EC4899",
                            "#84CC16"

                        ]

                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }

    );

}

// ============================
// Bar Chart
// ============================

function updateBarChart() {

    const months = {};

    expenses.forEach(expense => {

        const month = expense.date.substring(0, 7);

        if (!months[month]) {

            months[month] = 0;

        }

        months[month] += Number(expense.amount);

    });

    const labels = Object.keys(months);

    const values = Object.values(months);

    if (barChart) {

        barChart.destroy();

    }

    barChart = new Chart(

        document.getElementById("barChart"),

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Monthly Expenses",

                        data: values,

                        backgroundColor: "#2563EB"

                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        }

    );

}

// ============================
// Initial Load
// ============================

window.onload = () => {

    budgetInput.value = budget;

    renderExpenses();

    updateSummary();

};

