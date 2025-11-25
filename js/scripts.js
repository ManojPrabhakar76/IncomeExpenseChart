document.addEventListener("DOMContentLoaded", function () {
    
    // input with id "username" onchange
    const usernameInput = document.getElementById("username");
    usernameInput.addEventListener("input", function () {
        console.log("Username changed to:", usernameInput.value);
        // You can add additional logic here to handle the username change
        // regex to check username has 1 capital letter, 1 number, 1 special character, and at least 8 characters length
        const username = usernameInput.value;
        const usernameRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!usernameRegex.test(username)) {
            usernameInput.style.borderColor = "red"; // Set border color to red
        } else {
            usernameInput.style.borderColor = "green"; // Set border color to green
        }
    });

    let barChart;

    // Function to retrieve income and expense data for each month
    function getMonthlyData() {
        const months = [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
        ];

        const data = {};

        months.forEach((month) => {
            const incomeInput = document.getElementById(`${month}-income`);
            const expensesInput = document.getElementById(`${month}-expenses`);

            const income = incomeInput ? parseFloat(incomeInput.value) || 0 : 0;
            const expenses = expensesInput ? parseFloat(expensesInput.value) || 0 : 0;

            data[month] = {
                income,
                expenses,
            };
        });

        console.log("Retrieved Monthly Data:", data); // Debugging line
        return data;
    }

    // Function to initialize the bar chart
    function initializeChart() {
        console.log("Initializing Chart..."); // Debugging line
        const ctx = document.getElementById("barChart").getContext("2d");
    
        // Custom plugin to draw income and expense values on the chart
        const drawValuesPlugin = {
            id: "drawValues",
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];
                        ctx.fillStyle = "black";
                        ctx.font = "12px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText(value, bar.x, bar.y - 10); // Draw the value above the bar
                    });
                });
            },
        };
    
        // Register the plugin
        Chart.register(drawValuesPlugin);
    
        // Initialize the chart
        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ],
                datasets: [
                    {
                        label: "Income",
                        data: [], // Initially empty
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Expenses",
                        data: [], // Initially empty
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
            plugins: [drawValuesPlugin], // Add the plugin to the chart
        });
    }

    // Function to update the chart with new data
    function updateChart() {
        const monthlyData = getMonthlyData();

        // Extract income and expenses data
        const incomeData = [];
        const expensesData = [];
        Object.keys(monthlyData).forEach((month) => {
            incomeData.push(monthlyData[month].income);
            expensesData.push(monthlyData[month].expenses);
        });

        console.log("Updating Chart with Data:", { incomeData, expensesData }); // Debugging line

        // Update the chart datasets
        barChart.data.datasets[0].data = incomeData;
        barChart.data.datasets[1].data = expensesData;

        // Refresh the chart
        barChart.update();
    }

    // Add an event listener to the Chart tab
    const chartTab = document.getElementById("chart-tab");
    chartTab.addEventListener("shown.bs.tab", function () {
        console.log("Chart tab clicked!"); // Debugging line

        // Initialize the chart only once
        if (!barChart) {
            console.log("Initializing chart..."); // Debugging line
            initializeChart();
        }

        console.log("Updating chart..."); // Debugging line
        // Update the chart whenever the Chart tab is clicked
        updateChart();

        // Resize the chart to ensure it renders properly
        barChart.resize();
    });

     // Add functionality to download the chart
    const downloadButton = document.getElementById("downloadChart");
    downloadButton.addEventListener("click", function () {
        if (barChart) {
            // Convert the chart to a Base64 image
            const image = barChart.toBase64Image();
    
            // Create a temporary link element
            const link = document.createElement("a");
            link.href = image;
            link.download = "chart_with_values.png"; // Set the file name
            link.click(); // Trigger the download
        } else {
            console.error("Chart is not initialized yet.");
        }
    });
});