// Function to get the entry type text
function getEntryTypeText(entryType) {
    if (entryType === "normal") {
        return "Normal";
    } else if (entryType === "overtime") {
        return "OT";
    } else if (entryType === "sunday_holiday") {
        return "Cuti";
    }
    return "";
}

// DOM element references
const addEntryButton = document.getElementById("add-entry");
const calculateSalaryButton = document.getElementById("calculate-salary");
const entriesList = document.getElementById("entries-list");
const totalSalaryOutput = document.getElementById("total-salary");

// Arrays and variables for data storage and calculations
let entries = [];
let totalNormalHours = 0;
let totalOvertimeHours = 0;
let totalSundayHolidayHours = 0;
let customRestHourDeduction = 0;

// Object to store total hours worked for each entry type
const totalHoursWorked = {
    normal: 0,
    overtime: 0,
    sunday_holiday: 0,
};

// Function to calculate the salary
function calculateSalary(hourlyRate, customRestHourDeduction) {
    // Reset the total hours
    totalNormalHours = 0;
    totalOvertimeHours = 0;
    totalSundayHolidayHours = 0;

    entries.forEach(entry => {
        const start = new Date(`2000-01-01T${entry.startTime}`);
        const end = new Date(`2000-01-01T${entry.endTime}`);
        let hoursWorked = (end - start) / (1000 * 60 * 60); // Hours worked for this entry

        // Deduct 1 hour by default for all types except "overtime" and "sunday_holiday"
        if (entry.entryType !== "overtime" && entry.entryType !== "sunday_holiday") {
            hoursWorked -= 1;
            // Ensure hoursWorked is not negative
            hoursWorked = Math.max(hoursWorked, 0);
        }

        // Update the total hours worked for the respective entry type
        totalHoursWorked[entry.entryType] += hoursWorked;

        // Update the total hours for summary
        if (entry.entryType === "normal") {
            totalNormalHours += hoursWorked;
        } else if (entry.entryType === "overtime") {
            totalOvertimeHours += hoursWorked;
        } else if (entry.entryType === "sunday_holiday") {
            totalSundayHolidayHours += hoursWorked;
        }
    });

    // Calculate the individual components of the salary
    const normalSalary = totalNormalHours * hourlyRate;
    const overtimeSalary = totalOvertimeHours * (hourlyRate * 1.5);
    const sundayHolidaySalary = totalSundayHolidayHours * (hourlyRate * 2);

    // Calculate the total salary with custom rest hour deduction
    const totalSalary = normalSalary + overtimeSalary + sundayHolidaySalary ;

    // Display the total salary
    totalSalaryOutput.textContent = `RM${totalSalary.toFixed(2)}`;

    // Show a confirmation popup
    Swal.fire({
        icon: 'info',
        title: 'Jumlah Gaji', // Total Salary
        text: `Jumlah gaji adalah RM${totalSalary.toFixed(2)}`, // Your total salary is
    });
}

// Event listener for the "Calculate Salary" button
calculateSalaryButton.addEventListener("click", () => {
    // Get the hourly rate from the input
    const hourlyRateInput = document.getElementById("hourly-rate");
    const hourlyRate = parseFloat(hourlyRateInput.value);

    // Validate the hourly rate
    if (isNaN(hourlyRate)) {
        Swal.fire({
            icon: 'error', // error
            title: 'Tiada Kadar Per-Jam', // Invalid Hourly Rate
            text: 'Sila isikan kadar per-jam yang sah', // Please enter a valid hourly rate.
        });
        return;
    }

    // Check if there are entries to calculate
    if (entries.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Tiada entri', // No Entries
            text: 'Tiada entri untuk dikira.', // There are no entries to calculate.
        });
        return;
    }

    // Add custom rest hour deduction
    const restHourSelect = document.getElementById("rest-hour");
    const restHourValue = restHourSelect.value;
    customRestHourDeduction = 0;

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
                // Update the custom rest hour deduction
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

        // Calculate the salary with default rest hour deduction
        calculateSalary(hourlyRate, defaultDeduction);
    }
});

// Function to update the entries list
function updateEntriesList() {
    entriesList.innerHTML = "";

    entries.forEach((entry, index) => {
        const start = new Date(`2000-01-01T${entry.startTime}`);
        const end = new Date(`2000-01-01T${entry.endTime}`);
        let hoursWorked = (end - start) / (1000 * 60 * 60); // Hours worked for this entry

        // Deduct 1 hour by default for all types except "overtime" and "sunday_holiday"
        if (entry.entryType !== "overtime" && entry.entryType !== "sunday_holiday") {
            hoursWorked -= 1;
            // Ensure hoursWorked is not negative
            hoursWorked = Math.max(hoursWorked, 0);
        }

        // Update the total hours worked for the respective entry type
        totalHoursWorked[entry.entryType] += hoursWorked;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.startTime}</td>
            <td>${entry.endTime}</td>
            <td>${getEntryTypeText(entry.entryType)}</td>
            <td>${Math.round(hoursWorked)}</td> <!-- Display hours worked for this entry -->
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
                icon: 'warning', // warning
                title: 'Padam entri?', // Delere Entry?
                text: 'Adakah anda pasti mahu memadamkan entri ini?', // Are you sure you want to delete this entry?
                showCancelButton: true,
                confirmButtonText: 'Padam', // Delete
                cancelButtonText: 'Batal', // Cancel
                confirmButtonColor: '#e74c3c',
            }).then((result) => {
                if (result.isConfirmed) {
                    // Deduct the deleted entry's hours from the respective entry type's total
                    const deletedEntry = entries[index];
                    const start = new Date(`2000-01-01T${deletedEntry.startTime}`);
                    const end = new Date(`2000-01-01T${deletedEntry.endTime}`);
                    let hoursWorked = (end - start) / (1000 * 60 * 60);
    
                    if (deletedEntry.entryType !== "sunday_holiday") {
                        hoursWorked -= 1;
                        hoursWorked = Math.max(hoursWorked, 0);
                    }
    
                    totalHoursWorked[deletedEntry.entryType] -= hoursWorked;
    
                    // Remove the entry from the entries array
                    entries.splice(index, 1);
                    updateEntriesList();
                    saveEntriesToLocalStorage();
                }
            });
        });
    });    

    saveEntriesToLocalStorage();
}

// Event listener for the "Add Entry" button
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
            icon: 'error', // error
            title: 'Tiada Tarikh', // Missing Date
            text: 'Sila pilih tarikh terlebih dahulu.', // Please enter a valid date.
        });
        return;
    }

    if (!startTime) {
        Swal.fire({
            icon: 'error', // error
            title: 'Tiada Masa Mula', // Missing Start Time
            text: 'Sila pilih Masa Mula terlebih dahulu', // Please enter a vaid start time.
        });
        return;
    }

    if (!endTime) {
        Swal.fire({
            icon: 'error', // error
            title: 'Tiada Masa Tamat', // Missing End Time
            text: 'Sila pilih Masa Tamat terlebih dahulu', // Please enter a valid end time.
        });
        return;
    }

    if (!entryType) {
        Swal.fire({
            icon: 'error', // error
            title: 'Tiada pilihan', // Missing Entry Type
            text: 'Sila pilih jenis pilihan terlebih dahulu.', // Please choose an entry type
        });
        return;
    }

    // If all input is valid, proceed to add the entry
    entries.push({ date, startTime, endTime, entryType });
    updateEntriesList();
    
    // Show success pop-up
    Swal.fire({
        icon: 'success', // success
        title: 'Entri Ditambah', // Entry Added
        text: 'Entri telah berjaya ditambah!', // The entry has been successfully added!
        showConfirmButton: false,
        timer: 1000,
    });
});

const deleteAllEntriesButton = document.getElementById("delete-all-entries");

// Event listener for the "Delete All Entries" button
deleteAllEntriesButton.addEventListener("click", () => {
    Swal.fire({
        icon: 'warning', // warning
        title: 'Padam semua entri?', // Delete All Entries?
        text: 'Adakah anda pasti mahu memadamkan semua entri?', // Are you sure you want to delete all entries?
        showCancelButton: true,
        confirmButtonText: 'Padam semua', // Delete All
        cancelButtonText: 'Batal', // Cancel
        confirmButtonColor: '#e74c3c',
    }).then((result) => {
        if (result.isConfirmed) {
            entries = []; // Clear all entries
            updateEntriesList();
            saveEntriesToLocalStorage();
        }
    });
});

// Code for saving and loading entries from local storage
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

// Code for showing the website update reminder
function showWebsiteUpdateReminder() {
    const popupSize = Cookies.get('popupSize');

    if (!popupSize) {
        // First-time visit, show the larger pop-up
        Swal.fire({
            icon: 'info',
            title: 'Informasi',
            html: 'Klik kotak [ + ] pada bahagian "INFORMASI" untuk cara penggunaan laman web ini.',
            confirmButtonText: 'Okay', // Dismiss
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
            <h3>INFORMASI</h3>
            <p>Klik kotak [ + ] pada bahagian "INFORMASI" untuk cara penggunaan laman web ini.</p>
            <button id="close-popup">Tutup</button>
        `;

        // Close the notification pop-up when the close button is clicked
        const closePopup = document.getElementById('close-popup');
        closePopup.addEventListener('click', function () {
            notificationPopup.style.display = 'none';
        });

        // Add any additional styles or customizations to the notification pop-up here
        // notificationPopup.style.maxWidth = '300px'; // Adjust the max-width as needed
        // notificationPopup.style.backgroundColor = '#f0f0f0'; // Adjust the background color as needed
    }
}

// Load stored entries when the page loads
loadEntriesFromLocalStorage();
