document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");

    usernameInput?.addEventListener("input", () => {
        console.log("Username changed to:", usernameInput.value);

        const username = usernameInput.value;
        const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~])[A-Za-z\d!@#$%^&*~]{8,}$/;

        usernameInput.style.borderColor = usernameRegex.test(username) ? "green" : "red";
    });

    let barChart;

    const getMonthlyData = () => {
        const months = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];

        return months.reduce((data, month) => {
            const incomeInput = document.getElementById(`${month}-income`);
            const expensesInput = document.getElementById(`${month}-expenses`);

            // Generate default values if inputs are empty
            const defaultExpenses = Math.floor(Math.random() * (800 - 200 + 1)) + 200; // Random value between 200 and 800
            const defaultIncome = Math.floor(Math.random() * (1000 - (defaultExpenses + 1) + 1)) + (defaultExpenses + 1); // Greater than expenses

            const income = incomeInput ? parseFloat(incomeInput.value) || defaultIncome : defaultIncome;
            const expenses = expensesInput ? parseFloat(expensesInput.value) || defaultExpenses : defaultExpenses;

            data[month] = { income, expenses };

            // Set default values in the input fields if empty
            if (incomeInput && !incomeInput.value) incomeInput.value = income;
            if (expensesInput && !expensesInput.value) expensesInput.value = expenses;

            return data;
        }, {});
    };

    const initializeChart = () => {
        console.log("Initializing Chart...");
        const ctx = document.getElementById("barChart")?.getContext("2d");

        if (!ctx) {
            console.error("Canvas context not found.");
            return;
        }

        const drawValuesPlugin = {
            id: "drawValues",
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];
                        ctx.fillStyle = "black";
                        ctx.font = "12px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText(value, bar.x, bar.y - 10);
                    });
                });
            },
        };

        Chart.register(drawValuesPlugin);

        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ],
                datasets: [
                    {
                        label: "Income",
                        data: [],
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Expenses",
                        data: [],
                        backgroundColor: "rgba(255, 99, 132, 0.6)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
            plugins: [drawValuesPlugin],
        });
    };

    const updateChart = () => {
        const monthlyData = getMonthlyData();

        const incomeData = Object.values(monthlyData).map(({ income }) => income);
        const expensesData = Object.values(monthlyData).map(({ expenses }) => expenses);

        console.log("Updating Chart with Data:", { incomeData, expensesData });

        if (barChart) {
            barChart.data.datasets[0].data = incomeData;
            barChart.data.datasets[1].data = expensesData;
            barChart.update();
        }
    };

    document.getElementById("chart-tab")?.addEventListener("shown.bs.tab", () => {
        console.log("Chart tab clicked!");

        if (!barChart) {
            console.log("Initializing chart...");
            initializeChart();
        }

        console.log("Updating chart...");
        updateChart();
        barChart?.resize();
    });

    document.getElementById("downloadChart")?.addEventListener("click", () => {
        if (barChart) {
            const image = barChart.toBase64Image();
            const link = document.createElement("a");
            link.href = image;
            link.download = "chart_with_values.png";
            link.click();
        } else {
            console.error("Chart is not initialized yet.");
        }
    });

       document.getElementById("sendEmail")?.addEventListener("click", async () => {
        const email = document.getElementById("emailAddress")?.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        // Validate the email address
        if (!emailRegex.test(email)) {
            alert("Invalid email address. Please enter a valid email.");
            return; // Stop execution if the email is invalid
        }
    
        if (!barChart) {
            alert("Chart is not initialized yet.");
            return;
        }
    
        // Convert chart to image
        barChart.update(); // Ensure the chart is fully updated
        const chartImage = barChart.toBase64Image("image/png", 0.8); // Reduce quality to 80%
    
        // Collect data
        const monthlyData = getMonthlyData();
        const dataSummary = Object.entries(monthlyData)
            .map(([month, { income, expenses }]) => `${month}: Income - $${income}, Expenses - $${expenses}`)
            .join("\n");
    
        try {
            // Send data to the backend
            const response = await fetch("http://localhost:3000/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, chartImage, dataSummary }),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert("Email sent successfully!");
            } else {
                alert(`Failed to send email: ${result.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while sending the email.");
        }
    });
});