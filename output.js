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
        Swal.fire({
            icon: 'error',
            title: 'Invalid Hourly Rate',
            text: 'Please enter a valid hourly rate.',
        });
        return;
    }

    if (entries.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Entries',
            text: 'There are no entries to calculate.',
        });
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

    Swal.fire({
        icon: 'info',
        title: 'Total Salary',
        text: `Your total salary is RM${totalSalary.toFixed(2)}`,
    });
});

addEntryButton.addEventListener("click", () => {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;
    const entryType = document.getElementById("entry-type").value;
    const hourlyRateInput = document.getElementById("hourly-rate");
    const hourlyRate = parseFloat(hourlyRateInput.value);

    // Check for missing or invalid input fields
    if (!date) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Date',
            text: 'Please enter a valid date.',
        });
        return;
    }

    if (!startTime) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Start Time',
            text: 'Please enter a valid start time.',
        });
        return;
    }

    if (!endTime) {
        Swal.fire({
            icon: 'error',
            title: 'Missing End Time',
            text: 'Please enter a valid end time.',
        });
        return;
    }

    if (!entryType) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Entry Type',
            text: 'Please choose an entry type.',
        });
        return;
    }

    // If all input is valid, proceed to add the entry
    entries.push({ date, startTime, endTime, entryType });
    updateEntriesList();
    
    // Show success pop-up
    Swal.fire({
        icon: 'success',
        title: 'Entry Added',
        text: 'The entry has been successfully added!',
        showConfirmButton: false,
        timer: 1000,
    });
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
            <td><button class="delete-entry" data-index="${index}">⌫</button></td>
        `;
        entriesList.appendChild(row);
    });

    const entriesCountElement = document.getElementById("entries-count");
    entriesCountElement.textContent = entries.length; // Update the count of entries

    const deleteButtons = document.querySelectorAll(".delete-entry");
    deleteButtons.forEach(button => {
        button.addEventListener("click", () => {
            const index = parseInt(button.getAttribute("data-index"));
            
            Swal.fire({
                icon: 'warning',
                title: 'Delete Entry?',
                text: 'Are you sure you want to delete this entry?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#e74c3c',
            }).then((result) => {
                if (result.isConfirmed) {
                    entries.splice(index, 1);
                    updateEntriesList();
                    saveEntriesToLocalStorage();
                }
            });
        });
    });

    saveEntriesToLocalStorage();
}

const deleteAllEntriesButton = document.getElementById("delete-all-entries");

deleteAllEntriesButton.addEventListener("click", () => {
    Swal.fire({
        icon: 'warning',
        title: 'Delete All Entries?',
        text: 'Are you sure you want to delete all entries?',
        showCancelButton: true,
        confirmButtonText: 'Delete All',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#e74c3c',
    }).then((result) => {
        if (result.isConfirmed) {
            entries = []; // Clear all entries
            updateEntriesList();
            saveEntriesToLocalStorage();
        }
    });
});

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
