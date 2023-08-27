function getEntryTypeText(entryType) {
    if (entryType === "normal") {
        return "Normal Hours";
    } else if (entryType === "overtime") {
        return "Overtime";
    } else if (entryType === "sunday_holiday") {
        return "Sunday/Public Holiday";
    }
    return "";
}

const addEntryButton = document.getElementById("add-entry");
const calculateSalaryButton = document.getElementById("calculate-salary");
const entriesList = document.getElementById("entries-list");
const totalSalaryOutput = document.getElementById("total-salary");

let entries = [];

calculateSalaryButton.addEventListener("click", () => {
    const hourlyRateInput = document.getElementById("hourly-rate");
    const hourlyRate = parseFloat(hourlyRateInput.value);

    if (isNaN(hourlyRate)) {
        alert("Please enter a valid hourly rate.");
        return;
    }

    let totalNormalHours = 0;
    let totalOvertimeHours = 0;
    let totalSundayHolidayHours = 0;

    entries.forEach(entry => {
        const start = new Date(`2000-01-01T${entry.startTime}`);
        const end = new Date(`2000-01-01T${entry.endTime}`);
        const hoursWorked = (end - start) / (1000 * 60 * 60);

        if (entry.entryType === "normal") {
            totalNormalHours += hoursWorked;
        } else if (entry.entryType === "overtime") {
            totalOvertimeHours += hoursWorked;
        } else if (entry.entryType === "sunday_holiday") {
            totalSundayHolidayHours += hoursWorked;
        }
    });

    const normalSalary = totalNormalHours * hourlyRate;
    const overtimeSalary = totalOvertimeHours * hourlyRate * 1.5;
    const sundayHolidaySalary = totalSundayHolidayHours * hourlyRate * 2;

    const totalSalary = normalSalary + overtimeSalary + sundayHolidaySalary;
    totalSalaryOutput.textContent = `RM${totalSalary.toFixed(2)}`;
});

addEntryButton.addEventListener("click", () => {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
    const entryType = document.getElementById("entry-type").value;
    
    entries.push({ date, startTime, endTime, entryType });
    updateEntriesList();
});

function updateEntriesList() {
    entriesList.innerHTML = "";

    entries.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.startTime}</td>
            <td>${entry.endTime}</td>
            <td>${getEntryTypeText(entry.entryType)}</td>
            <td><button class="delete-entry" data-index="${index}">x</button></td>
        `;
        entriesList.appendChild(row);
    });

    const deleteButtons = document.querySelectorAll(".delete-entry");
    deleteButtons.forEach(button => {
        button.addEventListener("click", () => {
            const index = parseInt(button.getAttribute("data-index"));
            entries.splice(index, 1);
            updateEntriesList();
            saveEntriesToLocalStorage(); // Save updated entries to Local Storage
        });
    });

    saveEntriesToLocalStorage(); // Save entries to Local Storage
}

function saveEntriesToLocalStorage() {
    localStorage.setItem("entries", JSON.stringify(entries));
}

function loadEntriesFromLocalStorage() {
    const storedEntries = localStorage.getItem("entries");
    if (storedEntries) {
        entries = JSON.parse(storedEntries);
        updateEntriesList();
    }
}

// Load stored entries when the page loads
loadEntriesFromLocalStorage();
