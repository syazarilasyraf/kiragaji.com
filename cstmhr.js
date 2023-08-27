 // Get all collapse buttons and their corresponding content
 const collapseButtons = document.querySelectorAll('.collapse-button');
 const collapseContents = document.querySelectorAll('.collapse-content');

 // Add event listeners for each collapse button
 collapseButtons.forEach((collapseButton, index) => {
   collapseButton.addEventListener('click', () => {
     if (collapseContents[index].classList.contains('collapsed')) {
       collapseContents[index].classList.remove('collapsed');
     } else {
       collapseContents[index].classList.add('collapsed');
     }
   });
 });

         // Find the #rest-hour select element
 const restHourSelect = document.getElementById("rest-hour");

 // Add an event listener to detect changes in the selected option
 restHourSelect.addEventListener("change", () => {
   const selectedOption = restHourSelect.value;

   if (selectedOption === "custom_hour") {
     // When "Custom hour" is selected, show a SweetAlert pop-up
     Swal.fire({
       title: "Custom Hour Deduction",
       text: "Enter the number of hours to deduct:",
       input: "number",
       inputAttributes: {
         min: 0, // Set the minimum value to 0
         step: 0.5, // Set the step increment to 0.5 hours (adjust as needed)
       },
       showCancelButton: true,
       confirmButtonText: "Deduct",
       cancelButtonText: "Cancel",
       inputValidator: (value) => {
         if (value < 0) {
           return "Please enter a valid number of hours (0 or greater).";
         }
       },
     }).then((result) => {
       if (result.isConfirmed) {
         const customHours = parseFloat(result.value);
         // Handle the custom hour deduction here
         // You can use the 'customHours' value as needed
         // For example, update the total salary based on this deduction
       } else {
         // User canceled the operation
       }
       // Reset the select element to its default option
       restHourSelect.value = "1_hour";
     });
   }
 });