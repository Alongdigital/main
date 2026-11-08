
/* =========================================================
   ALONGDIGITAL — MARKSHEET ENGINE
   File       : marksheet.js
   Project    : Student Result Portal
   Developer  : S. S. Rajput
   Version    : 1.0.0
   ========================================================= */

"use strict";


/* ---------------------------------------------------------
   01. MARKSHEET CONFIGURATION
--------------------------------------------------------- */

const MARKSHEET_CONFIG = Object.freeze({

  API_URL: APP_CONFIG.API.BASE_URL,

  RESULT_ACTION: APP_CONFIG.API.ACTIONS.GET_RESULT,

  SEARCH_PAGE: "index.html",

  ENABLE_PRINT: true,

  ENABLE_DOWNLOAD: true

});


/* ---------------------------------------------------------
   02. ELEMENT REFERENCES
--------------------------------------------------------- */

const elements = {

  studentName: document.getElementById("studentName"),

  studentId: document.getElementById("studentId"),

  rollNumber: document.getElementById("rollNumber"),

  studentClass: document.getElementById("studentClass"),

  section: document.getElementById("section"),

  dob: document.getElementById("dob"),

  session: document.getElementById("session"),

  examName: document.getElementById("examName"),

  studentPhoto: document.getElementById("studentPhoto"),

  marksTable: document.getElementById("marksTable"),

  totalObtained: document.getElementById("totalObtained"),

  totalMaximum: document.getElementById("totalMaximum"),

  percentage: document.getElementById("percentage"),

  grade: document.getElementById("grade"),

  resultStatus: document.getElementById("resultStatus"),

  resultMessage: document.getElementById("resultMessage"),

  loading: document.getElementById("marksheetLoading")

};


/* ---------------------------------------------------------
   03. SAFE TEXT DISPLAY
--------------------------------------------------------- */

function setText(element, value) {

  if (!element) return;

  element.textContent =
    value === undefined || value === null || value === ""
      ? "—"
      : String(value);

}


/* ---------------------------------------------------------
   04. MESSAGE HANDLER
--------------------------------------------------------- */

function showMarksheetMessage(message, type = "error") {

  if (!elements.resultMessage) {

    alert(message);

    return;

  }

  elements.resultMessage.textContent = message;

  elements.resultMessage.className =
    "result-message " + type;

  elements.resultMessage.style.display = "block";

}


/* ---------------------------------------------------------
   05. LOADING HANDLER
--------------------------------------------------------- */

function setMarksheetLoading(isLoading) {

  if (elements.loading) {

    elements.loading.style.display =
      isLoading ? "block" : "none";

  }

}


/* ---------------------------------------------------------
   06. GET STUDENT ID
--------------------------------------------------------- */

function getMarksheetStudentID() {

  const params = new URLSearchParams(
    window.location.search
  );

  const urlID = params.get("studentId");

  const sessionID = sessionStorage.getItem(
    "alongDigitalStudentID"
  );

  return urlID || sessionID || "";

}


/* ---------------------------------------------------------
   07. FETCH RESULT FROM SERVER
--------------------------------------------------------- */

async function fetchMarksheetResult(studentId) {

  if (!MARKSHEET_CONFIG.API_URL) {

    throw new Error(
      "Result server is not connected yet."
    );

  }

  const response = await fetch(
    MARKSHEET_CONFIG.API_URL,
    {

      method: "POST",

      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify({

        action: MARKSHEET_CONFIG.RESULT_ACTION,

        studentId: studentId,

        session: APP_CONFIG.ACADEMIC?.SESSION || ""

      })

    }
  );

  if (!response.ok) {

    throw new Error(
      "Unable to retrieve the marksheet."
    );

  }

  const result = await response.json();

  if (
    result.success !== true ||
    !result.data
  ) {

    throw new Error(
      result.message || "Student result not found."
    );

  }

  return result.data;

}


/* ---------------------------------------------------------
   08. STUDENT DETAILS
--------------------------------------------------------- */

function renderStudentDetails(student) {

  setText(elements.studentName, student.name);

  setText(elements.studentId, student.studentId);

  setText(elements.rollNumber, student.rollNumber);

  setText(elements.studentClass, student.class);

  setText(elements.section, student.section);

  setText(elements.dob, student.dob);

  setText(elements.session, student.session);

  setText(elements.examName, student.examName);


  if (elements.studentPhoto) {

    const photoURL = student.photo || "";

    if (photoURL) {

      elements.studentPhoto.src = photoURL;

    } else {

      elements.studentPhoto.src =
        ASSETS.IMAGES.STUDENT_DEFAULT || "";

    }

    elements.studentPhoto.onerror = function() {

      this.onerror = null;

      this.src = ASSETS.IMAGES.STUDENT_DEFAULT || "";

    };

  }

}


/* ---------------------------------------------------------
   09. RENDER SUBJECT MARKS
--------------------------------------------------------- */

function renderSubjectMarks(subjects) {

  if (!elements.marksTable) return;

  elements.marksTable.innerHTML = "";

  if (!Array.isArray(subjects) || subjects.length === 0) {

    elements.marksTable.textContent =
      "No subject records available.";

    return;

  }

  let totalObtained = 0;

  let totalMaximum = 0;

  let allSubjectsPassed = true;

  subjects.forEach(subject => {

    const obtained = Number(subject.obtained);

    const maximum = Number(subject.maximum);

    if (
      !Number.isFinite(obtained) ||
      !Number.isFinite(maximum) ||
      maximum <= 0 ||
      obtained < 0 ||
      obtained > maximum
    ) {

      throw new Error("Invalid subject marks received.");

    }

    totalObtained += obtained;

    totalMaximum += maximum;

    const subjectPercentage =
      (obtained / maximum) * 100;

    const passed =
      subjectPercentage >=
      APP_CONFIG.RESULT.PASSING_PERCENTAGE;

    if (!passed) allSubjectsPassed = false;

    const row = document.createElement("tr");

    const values = [

      subject.subject || "—",

      obtained,

      maximum,

      subjectPercentage.toFixed(2) + "%",

      passed ? "Pass" : "Needs Review"

    ];

    values.forEach(value => {

      const cell = document.createElement("td");

      cell.textContent = String(value);

      row.appendChild(cell);

    });

    elements.marksTable.appendChild(row);

  });

  renderMarksheetSummary(
    totalObtained,
    totalMaximum,
    allSubjectsPassed
  );

}


/* ---------------------------------------------------------
   10. RESULT SUMMARY
--------------------------------------------------------- */

function renderMarksheetSummary(
  obtained,
  maximum,
  allSubjectsPassed
) {

  if (maximum <= 0) {

    throw new Error("Invalid total maximum marks.");

  }

  const percentage =
    (obtained / maximum) * 100;

  const grade = getGrade(percentage);

  const passed =
    allSubjectsPassed &&
    percentage >= APP_CONFIG.RESULT.PASSING_PERCENTAGE;

  setText(elements.totalObtained, obtained);

  setText(elements.totalMaximum, maximum);

  setText(
    elements.percentage,
    percentage.toFixed(2) + "%"
  );

  setText(elements.grade, grade);

  setText(
    elements.resultStatus,
    passed ? "PASS" : "NEEDS REVIEW"
  );

}


/* ---------------------------------------------------------
   11. MAIN MARKSHEET RENDERER
--------------------------------------------------------- */

function renderMarksheet(data) {

  if (!data || !data.student || !data.subjects) {

    throw new Error("Incomplete result information.");

  }

  renderStudentDetails(data.student);

  renderSubjectMarks(data.subjects);

}


/* ---------------------------------------------------------
   12. PRINT MARKSHEET
--------------------------------------------------------- */

function printMarksheet() {

  if (!MARKSHEET_CONFIG.ENABLE_PRINT) return;

  window.print();

}


/* ---------------------------------------------------------
   13. DOWNLOAD MARKSHEET
--------------------------------------------------------- */

function downloadMarksheet() {

  if (!MARKSHEET_CONFIG.ENABLE_DOWNLOAD) return;

  /*
    PDF download will be connected later.
    Browser print dialog can save the marksheet as PDF.
  */

  window.print();

}


/* ---------------------------------------------------------
   14. INITIALIZE MARKSHEET
--------------------------------------------------------- */

async function initializeMarksheet() {

  const studentId = getMarksheetStudentID();

  if (!validateStudentID(studentId)) {

    showMarksheetMessage(
      "Invalid Student ID. Please search again."
    );

    return;

  }

  setMarksheetLoading(true);

  try {

    const result = await fetchMarksheetResult(studentId);

    renderMarksheet(result);

  } catch (error) {

    showMarksheetMessage(
      error.message || "Unable to load marksheet."
    );

  } finally {

    setMarksheetLoading(false);

  }

}


/* ---------------------------------------------------------
   15. INITIALIZE PAGE
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function() {

  initializeMarksheet();

  console.info(
    "AlongDigital Marksheet Engine Initialized"
  );


});
