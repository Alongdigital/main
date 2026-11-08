
/* =========================================================
   ALONGDIGITAL — STUDENT RESULT SEARCH
   File       : search.js
   Project    : Student Result Portal
   Developer  : S. S. Rajput
   Version    : 1.0.0
   ========================================================= */

"use strict";


/* ---------------------------------------------------------
   01. SEARCH CONFIGURATION
--------------------------------------------------------- */

const SEARCH_CONFIG = Object.freeze({

  STUDENT_ID_LENGTH: 11,

  MARKSHEET_PAGE: "marksheet.html",

  API_URL: APP_CONFIG.API.BASE_URL,

  SEARCH_ACTION: APP_CONFIG.API.ACTIONS.GET_RESULT,

  REDIRECT_DELAY: 500

});



/* ---------------------------------------------------------
   02. ELEMENT REFERENCES
--------------------------------------------------------- */

const searchForm = document.getElementById("resultSearchForm");

const studentIdInput = document.getElementById("studentId");

const searchButton = document.getElementById("searchButton");

const searchMessage = document.getElementById("searchMessage");

const loadingIndicator = document.getElementById("searchLoading");


/* ---------------------------------------------------------
   03. MESSAGE HANDLER
--------------------------------------------------------- */

function showSearchMessage(message, type = "error") {

  if (!searchMessage) {
    alert(message);
    return;
  }

  searchMessage.textContent = message;

  searchMessage.className = "search-message " + type;

  searchMessage.style.display = "block";

}


/* ---------------------------------------------------------
   04. CLEAR MESSAGE
--------------------------------------------------------- */

function clearSearchMessage() {

  if (!searchMessage) return;

  searchMessage.textContent = "";

  searchMessage.style.display = "none";

}


/* ---------------------------------------------------------
   05. LOADING STATE
--------------------------------------------------------- */

function setSearchLoading(isLoading) {

  if (searchButton) {

    searchButton.disabled = isLoading;

    searchButton.textContent = isLoading
      ? "Searching..."
      : "Search Result";

  }

  if (loadingIndicator) {

    loadingIndicator.style.display = isLoading
      ? "block"
      : "none";

  }

}


/* ---------------------------------------------------------
   06. STUDENT ID VALIDATION
--------------------------------------------------------- */

function validateSearchStudentID(studentId) {

  const id = String(studentId).trim();

  if (!id) {

    showSearchMessage("Please enter your Student ID.");

    return false;

  }

  if (!APP_CONFIG.STUDENT.ID_PATTERN.test(id)) {

    showSearchMessage(
      "Student ID must contain exactly 11 digits."
    );

    return false;

  }

  return true;

}


/* ---------------------------------------------------------
   07. API REQUEST
--------------------------------------------------------- */

async function fetchStudentResult(studentId) {

  if (!SEARCH_CONFIG.API_URL) {

    throw new Error(
      "Result service is not connected yet. Please try again later."
    );

  }

  const response = await fetch(SEARCH_CONFIG.API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      action: SEARCH_CONFIG.SEARCH_ACTION,

      studentId: studentId,

      session: APP_CONFIG.ACADEMIC?.SESSION || ""

    })

  });

  if (!response.ok) {

    throw new Error("Unable to connect to the result server.");

  }

  const result = await response.json();

  return result;

}


/* ---------------------------------------------------------
   08. HANDLE SEARCH
--------------------------------------------------------- */

async function handleResultSearch(event) {

  event.preventDefault();

  clearSearchMessage();

  const studentId = studentIdInput.value.trim();

  if (!validateSearchStudentID(studentId)) {

    return;

  }

  setSearchLoading(true);

  try {

    const result = await fetchStudentResult(studentId);

    if (!result || result.success !== true || !result.data) {

      throw new Error(
        result?.message || "No result found for this Student ID."
      );

    }

    /*
      Store only the verified Student ID.
      The marksheet page should fetch the result
      again from the server.
    */

    sessionStorage.setItem(
      "alongDigitalStudentID",
      studentId
    );

    setTimeout(() => {

      const url = new URL(
        SEARCH_CONFIG.MARKSHEET_PAGE,
        window.location.href
      );

      url.searchParams.set("studentId", studentId);

      window.location.href = url.toString();

    }, SEARCH_CONFIG.REDIRECT_DELAY);

  } catch (error) {

    showSearchMessage(
      error.message || "Something went wrong. Please try again."
    );

    setSearchLoading(false);

  }

}


/* ---------------------------------------------------------
   09. INPUT FORMATTING
--------------------------------------------------------- */

if (studentIdInput) {

  studentIdInput.addEventListener("input", function() {

    this.value = this.value
      .replace(/\D/g, "")
      .slice(0, SEARCH_CONFIG.STUDENT_ID_LENGTH);

    clearSearchMessage();

  });

}


/* ---------------------------------------------------------
   10. FORM EVENT
--------------------------------------------------------- */

if (searchForm) {

  searchForm.addEventListener(
    "submit",
    handleResultSearch
  );

}


/* ---------------------------------------------------------
   11. INITIALIZATION
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function() {

  console.info(
    "AlongDigital Result Search Initialized"
  );

});
