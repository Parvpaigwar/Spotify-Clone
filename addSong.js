document.getElementById("addSongsBtn").addEventListener("click", function() {
    var formContainer = document.getElementById("uploadFormContainer");
    // Toggle the visibility of the form
    if (formContainer.style.display === "none" || formContainer.style.display === "") {
      formContainer.style.display = "block";  // Show the form
    } else {
      formContainer.style.display = "none";  // Hide the form
    }
  });
  