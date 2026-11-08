
"use strict";

/* =====================================
   ALONGDIGITAL - MARKSHEET CONTROLLER
===================================== */

document.addEventListener("DOMContentLoaded", () => {

  const CONFIG = window.APP_CONFIG;

  const elements = {
    studentName: document.getElementById("studentName"),
    studentId: document.getElementById("studentId"),
    rollNumber: document.getElementById("rollNumber"),
    studentClass: document.getElementById("studentClass"),
    studentSection: document.getElementById("studentSection"),
    schoolName: document.getElementById("schoolName"),

    examName: document.getElementById("examName"),
    examSession: document.getElementById("examSession"),

    marksTableBody: document.getElementById("marksTableBody"),

    totalMarks: document.getElementById("totalMarks"),
    percentage: document.getElementById("percentage"),
    overallGrade: document.getElementById("overallGrade"),
    resultStatus: document.getElementById("resultStatus")
  };

  /* =====================================
     INITIALIZATION
  ===================================== */

  function initialize() {

    if (!CONFIG) {
      showError("Configuration file could not be loaded.");
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const studentId =
      params.get("studentId") ||
      sessionStorage.getItem("verifiedStudentId");

    const rollNumber =
      params.get("rollNumber") ||
      sessionStorage.getItem("verifiedRollNumber");

    if (!studentId || !rollNumber) {
      showError("Student verification details are missing. Please search again.");
      return;
    }

    if (
      !CONFIG.STUDENT.ID_PATTERN.test(studentId) ||
      !CONFIG.STUDENT.ROLL_PATTERN.test(rollNumber)
    ) {
      showError("Invalid student verification details.");
      return;
    }

    fetchMarksheet(studentId, rollNumber);
  }

  /* =====================================
     FETCH RESULT FROM BACKEND
  ===================================== */

  async function fetchMarksheet(studentId, rollNumber) {

    const apiUrl = CONFIG.API.BASE_URL;

    if (!apiUrl) {
      showError("Result database connection is pending.");
      return;
    }

    try {

      showLoading();

      const response = await fetch(apiUrl, {
        method: "POST",

        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          action: "getResult",
          studentId: studentId,
          rollNumber: rollNumber,
          session: CONFIG.ACADEMIC.SESSION
        })

      });

      if (!response.ok) {
        throw new Error("Server connection failed.");
      }

      const data = await response.json();

      if (!data.success || !data.student || !Array.isArray(data.marks)) {
        throw new Error(
          data.message || "Result record was not found."
        );
      }

      if (
        String(data.student.studentId) !== studentId ||
        String(data.student.rollNumber) !== rollNumber
      ) {
        throw new Error("Student verification failed.");
      }

      displayMarksheet(data);

    } catch (error) {

      console.error("Marksheet Error:", error);

      showError(
        error.message || "Unable to load marksheet."
      );

    }
  }

  /* =====================================
     DISPLAY STUDENT INFORMATION
  ===================================== */

  function displayMarksheet(data) {

    const student = data.student;

    elements.studentName.textContent = student.name || "--";
    elements.studentId.textContent = student.studentId || "--";
    elements.rollNumber.textContent = student.rollNumber || "--";
    elements.studentClass.textContent = student.class || "--";
    elements.studentSection.textContent = student.section || "--";
    elements.schoolName.textContent = student.schoolName || "--";

    elements.examName.textContent =
      data.examName || CONFIG.ACADEMIC.DEFAULT_EXAM;

    elements.examSession.textContent =
      data.session || CONFIG.ACADEMIC.SESSION;

    displaySubjectMarks(data.marks);

    calculateSummary(data.marks, data.resultStatus);

  }

  /* =====================================
     SUBJECT-WISE MARKS TABLE
  ===================================== */

  function displaySubjectMarks(marks) {

    elements.marksTableBody.innerHTML = "";

    marks.forEach((subject, index) => {

      const row = document.createElement("tr");

      const serial = document.createElement("td");
      const name = document.createElement("td");
      const maximum = document.createElement("td");
      const obtained = document.createElement("td");
      const grade = document.createElement("td");

      serial.textContent = String(index + 1).padStart(2, "0");
      name.textContent = subject.subject || "--";
      maximum.textContent = subject.maximumMarks ?? "--";
      obtained.textContent = subject.obtainedMarks ?? "--";
      grade.textContent = subject.grade || "--";

      row.append(
        serial,
        name,
        maximum,
        obtained,
        grade
      );

      elements.marksTableBody.appendChild(row);

    });

  }

  /* =====================================
     CALCULATE RESULT SUMMARY
  ===================================== */

  function calculateSummary(marks, serverStatus) {

    let totalObtained = 0;
    let totalMaximum = 0;
    let failed = false;

    marks.forEach(subject => {

      const obtained = Number(subject.obtainedMarks);
      const maximum = Number(subject.maximumMarks);
      const passing = Number(subject.passingMarks ?? 0);

      if (
        !Number.isFinite(obtained) ||
        !Number.isFinite(maximum) ||
        obtained < 0 ||
        maximum <= 0 ||
        obtained > maximum
      ) {
        throw new Error("Invalid marks received from server.");
      }

      totalObtained += obtained;
      totalMaximum += maximum;

      if (obtained < passing) {
        failed = true;
      }

    });

    const percentage =
      totalMaximum > 0
        ? (totalObtained / totalMaximum) * 100
        : 0;

    const grade = getGrade(percentage);

    const status = failed ? "FAIL" : "PASS";

    elements.totalMarks.textContent =
      `${totalObtained} / ${totalMaximum}`;

    elements.percentage.textContent =
      `${percentage.toFixed(2)}%`;

    elements.overallGrade.textContent = grade;

    elements.resultStatus.textContent =
      serverStatus || status;

    elements.resultStatus.style.color =
      status === "PASS" ? "#188344" : "#c0392b";

  }

  /* =====================================
     GRADE CALCULATION
  ===================================== */

  function getGrade(percentage) {

    if (percentage >= 91) return "A1";
    if (percentage >= 81) return "A2";
    if (percentage >= 71) return "B1";
    if (percentage >= 61) return "B2";
    if (percentage >= 51) return "C1";
    if (percentage >= 41) return "C2";
    if (percentage >= 33) return "D";

    return "E";
  }

  /* =====================================
     LOADING MESSAGE
  ===================================== */

  function showLoading() {

    elements.marksTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:25px;">
          Loading your marksheet...
        </td>
      </tr>
    `;

    elements.resultStatus.textContent = "LOADING...";
  }

  /* =====================================
     ERROR MESSAGE
  ===================================== */

  function showError(message) {

    elements.marksTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:25px;color:#c0392b;">
          ${escapeHTML(message)}
        </td>
      </tr>
    `;

    elements.resultStatus.textContent = "UNAVAILABLE";
    elements.resultStatus.style.color = "#c0392b";

  }

  function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  }

  /* =====================================
     START
  ===================================== */

  initialize();

});
