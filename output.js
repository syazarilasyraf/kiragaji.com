function getEntryTypeText(entryType) {
    if (entryType === "normal") {
        return "Normal";
    } else if (entryType === "overtime") {
        return "OT";
    } else if (entryType === "sunday_holiday") {
        return "Sun/PH";
    }
    return "";
}

const addEntryButton = document.getElementById("add-entry");
const calculateSalaryButton = document.getElementById("calculate-salary");
const entriesList = document.getElementById("entries-list");
const totalSalaryOutput = document.getElementById("total-salary");

let entries = [];

let totalNormalHours = 0;
let totalOvertimeHours = 0;
let totalSundayHolidayHours = 0;
let customRestHourDeduction = 0;

calculateSalaryButton.addEventListener("click", () => {
    totalNormalHours = 0;            // Reset these variables
    totalOvertimeHours = 0;
    totalSundayHolidayHours = 0;

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

    // Add custom rest hour deduction
    const restHourSelect = document.getElementById("rest-hour");
    const restHourValue = restHourSelect.value;
    let customRestHourDeduction = 0;

    if (restHourValue === "custom_hour") {
        Swal.fire({
            title: "Enter Custom Rest Hours",
            input: "text",
            inputLabel: "Hours",
            inputPlaceholder: "Enter the number of hours to deduct",
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
                if (!value || isNaN(value) || parseFloat(value) < 0) {
                    return "Please enter a valid number of hours to deduct.";
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Removed the 'let' keyword to update the outer variable
                customRestHourDeduction = parseFloat(result.value);
                // Proceed to calculate the salary with custom rest hour deduction
                calculateSalary(hourlyRate, customRestHourDeduction);
            }
        });
    } else {
        // Determine the default deduction based on the selected entry type
        const entryTypeSelect = document.getElementById("entry-type");
        const selectedEntryType = entryTypeSelect.value;

        // Deduct 1 hour by default for all types except "sunday_holiday"
        const defaultDeduction = selectedEntryType !== "sunday_holiday" ? 1 : 0;

        calculateSalary(hourlyRate, defaultDeduction);
    }
});

function calculateSalary(hourlyRate, customRestHourDeduction) {
    entries.forEach(entry => {
        const start = new Date(`2000-01-01T${entry.startTime}`);
        const end = new Date(`2000-01-01T${entry.endTime}`);
        let hoursWorked = (end - start) / (1000 * 60 * 60); // Use 'let' instead of 'const'

        // // Deduct 1 hour by default for all types except "sunday_holiday"
        // if (entry.entryType !== "sunday_holiday") {
        //     // Ensure hoursWorked is not negative
        //     hoursWorked = Math.max(hoursWorked - 1, 0);
        // }
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

    // Calculate the total salary with custom rest hour deduction
    const totalSalary = (normalSalary + overtimeSalary + sundayHolidaySalary) - (customRestHourDeduction * hourlyRate);
    
    totalSalaryOutput.textContent = `RM${totalSalary.toFixed(2)}`;

    Swal.fire({
        icon: 'info',
        title: 'Total Salary',
        text: `Your total salary is RM${totalSalary.toFixed(2)}`,
    });
}

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

    // Show the reminder pop-up
    showWebsiteUpdateReminder();
}

function showWebsiteUpdateReminder() {
    const popupSize = Cookies.get('popupSize');

    if (!popupSize) {
        // First-time visit, show the larger pop-up
        Swal.fire({
            icon: 'info',
            title: 'Website Update',
            html: 'We have made changes to the website. For correct calculations, please consider clearing your data and re-entering your entries.',
            confirmButtonText: 'Dismiss',
        });

        // Set a cookie to remember that the user has seen the pop-up
        Cookies.set('popupSize', 'large', { expires: 365 }); // Cookie expires in 1 year
    } else {
        // Returning user, show the smaller pop-up with the notification content
        const bellIcon = document.getElementById('bell-icon');
        const notificationPopup = document.getElementById('notification-popup');

        // Show the notification pop-up when the bell icon is clicked
        bellIcon.addEventListener('click', function () {
            notificationPopup.style.display = 'block';
        });

        // Access the notification content and set your notification message
        const notificationContent = document.querySelector('.notification-content');
        notificationContent.innerHTML = `
            <h3>Website Update</h3>
            <p>We have made changes to the website. For correct calculations, please consider clearing your data and re-entering your entries.</p>
            <button id="close-popup">Dismiss</button>
        `;

        // Close the notification pop-up when the close button is clicked
        const closePopup = document.getElementById('close-popup');
        closePopup.addEventListener('click', function () {
            notificationPopup.style.display = 'none';
        });

        // // Add any additional styles or customizations to the notification pop-up here
        // notificationPopup.style.maxWidth = '300px'; // Adjust the max-width as needed
        // notificationPopup.style.backgroundColor = '#f0f0f0'; // Adjust the background color as needed

    }
}

// Load stored entries when the page loads
loadEntriesFromLocalStorage();
