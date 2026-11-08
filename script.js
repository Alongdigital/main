
"use strict";

/* =====================================
   ALONGDIGITAL RESULT PORTAL
   MAIN SEARCH SCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("resultSearchForm");
  const studentIdInput = document.getElementById("studentId");
  const rollNumberInput = document.getElementById("rollNumber");
  const searchButton = document.getElementById("searchButton");
  const searchMessage = document.getElementById("searchMessage");
  const searchLoading = document.getElementById("searchLoading");


  // Check required HTML elements
  if (
    !form ||
    !studentIdInput ||
    !rollNumberInput ||
    !searchButton ||
    !searchMessage ||
    !searchLoading
  ) {
    console.error("Result search elements are missing.");
    return;
  }


  /* =====================================
     MESSAGE HANDLING
  ===================================== */

  function showMessage(message, type = "error") {

    searchMessage.textContent = message;
    searchMessage.className = "message show " + type;

  }


  function hideMessage() {

    searchMessage.textContent = "";
    searchMessage.className = "message";

  }


  /* =====================================
     LOADING HANDLING
  ===================================== */

  function setLoading(status) {

    searchButton.disabled = status;

    searchButton.textContent = status
      ? "Please Wait..."
      : "Search Result";

    searchLoading.classList.toggle("show", status);

  }


  /* =====================================
     INPUT VALIDATION
  ===================================== */

  function validateInputs() {

    const studentId = studentIdInput.value.trim();
    const rollNumber = rollNumberInput.value.trim();

    const validation = validateSearchDetails(
      studentId,
      rollNumber
    );

    if (!validation.valid) {
      showMessage(validation.message, "error");
      return null;
    }

    return {
      studentId,
      rollNumber
    };

  }


  /* =====================================
     API REQUEST
     GOOGLE APPS SCRIPT INTEGRATION
  ===================================== */

  async function fetchStudentResult(studentId, rollNumber) {

    const apiUrl = APP_CONFIG.API.BASE_URL;

    if (!apiUrl) {
      throw new Error(
        "Result database connection is not configured yet."
      );
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, APP_CONFIG.API.TIMEOUT);

    try {

      const response = await fetch(apiUrl, {

        method: APP_CONFIG.API.METHOD,

        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

          [APP_CONFIG.REQUEST.ACTION]:
            APP_CONFIG.API.ACTIONS.GET_RESULT,

          [APP_CONFIG.REQUEST.STUDENT_ID]:
            studentId,

          [APP_CONFIG.REQUEST.ROLL_NUMBER]:
            rollNumber,

          [APP_CONFIG.REQUEST.SESSION]:
            APP_CONFIG.ACADEMIC.SESSION

        }),

        signal: controller.signal

      });

      if (!response.ok) {
        throw new Error("Server request failed.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || APP_CONFIG.MESSAGES.NOT_FOUND
        );
      }

      return result;

    } finally {

      clearTimeout(timeout);

    }

  }


  /* =====================================
     FORM SUBMISSION
  ===================================== */

  form.addEventListener("submit", async event => {

    event.preventDefault();

    hideMessage();

    const details = validateInputs();

    if (!details) return;

    // Prevent accidental duplicate requests
    setLoading(true);

    try {

      const result = await fetchStudentResult(
        details.studentId,
        details.rollNumber
      );

      // Save only verified student identifiers
      sessionStorage.setItem(
        "AD_VERIFIED_STUDENT_ID",
        details.studentId
      );

      sessionStorage.setItem(
        "AD_VERIFIED_ROLL_NUMBER",
        details.rollNumber
      );

      showMessage(
        "Student verified. Opening marksheet...",
        "success"
      );

      const target = new URL(
        APP_CONFIG.ROUTES.MARKSHEET,
        window.location.href
      );

      target.searchParams.set(
        "studentId",
        details.studentId
      );

      window.location.href = target.href;

    } catch (error) {

      console.error("Result Search Error:", error);

      if (error.name === "AbortError") {

        showMessage(
          "Request timed out. Please try again.",
          "error"
        );

      } else if (
        error.message.includes("not configured")
      ) {

        showMessage(
          "Result database connection is pending.",
          "error"
        );

      } else {

        showMessage(
          error.message || APP_CONFIG.MESSAGES.SERVER_ERROR,
          "error"
        );

      }

    } finally {

      setLoading(false);

    }

  });


  /* =====================================
     INPUT RESTRICTIONS
  ===================================== */

  studentIdInput.addEventListener("input", () => {

    studentIdInput.value =
      studentIdInput.value.replace(/\D/g, "").slice(0, 11);

    hideMessage();

  });


  rollNumberInput.addEventListener("input", () => {

    rollNumberInput.value =
      rollNumberInput.value.replace(/\D/g, "").slice(0, 5);

    hideMessage();

  });


  console.info("AlongDigital Result Search Initialized.");

});
