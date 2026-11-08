
/* =========================================================
   ALONGDIGITAL — APPLICATION CONFIGURATION
   Project  : Student Result Portal
   Version  : 1.0.0
   Developer: S. S. Rajput
   ========================================================= */

"use strict";


/* ---------------------------------------------------------
   01. APPLICATION INFORMATION
--------------------------------------------------------- */

const APP_CONFIG = Object.freeze({

  APP: {
    NAME: "AlongDigital",
    VERSION: "1.0.0",
    TYPE: "Student Result Management System",
    ENVIRONMENT: "development",
    DEBUG: true
  },


  /* -------------------------------------------------------
     02. APPLICATION ROUTES
  ------------------------------------------------------- */

  ROUTES: {
    HOME: "index.html",
    MARKSHEET: "marksheet.html",
    ADMIN_LOGIN: "adminlogin.html",

    ADMIN_DASHBOARD: "admin/dashboard.html",
    ADMIN_STUDENTS: "admin/students.html",
    ADMIN_MARKS: "admin/marks.html",
    ADMIN_SETTINGS: "admin/settings.html"
  },


  /* -------------------------------------------------------
     03. STUDENT CONFIGURATION
  ------------------------------------------------------- */

  STUDENT: {
    ID_LENGTH: 11,
    ID_PATTERN: /^[0-9]{11}$/,

    ROLL_MIN_LENGTH: 4,
    ROLL_MAX_LENGTH: 5,

    ALLOW_DUPLICATE_ID: false,

    CLASSES: [
      "III", "IV", "V", "VI", "VII",
      "VIII", "IX", "X", "XI", "XII"
    ],

    SECTIONS: [
      "A", "B", "C", "D", "E",
      "F", "G", "H"
    ]
  },


  /* -------------------------------------------------------
     04. EXAMINATION CONFIGURATION
  ------------------------------------------------------- */

  EXAM: {
    DEFAULT: "Annual Examination",

    TYPES: [
      "Unit Test",
      "Half Yearly",
      "Annual Examination",
      "Practical"
    ],

    ALLOW_MARKS_EDIT: true,
    ALLOW_MARKS_DELETE: true,

    MIN_MARKS: 0,
    MAX_MARKS: 100
  },


  /* -------------------------------------------------------
     05. RESULT RULES
  ------------------------------------------------------- */

  RESULT: {
    PASSING_PERCENTAGE: 33,

    GRADE_SYSTEM: true,
    SHOW_PERCENTAGE: true,
    SHOW_TOTAL: true,

    STATUS: {
      DRAFT: "draft",
      PUBLISHED: "published",
      HIDDEN: "hidden"
    },

    DEFAULT_STATUS: "draft"
  },


  /* -------------------------------------------------------
     06. GRADE SYSTEM
  ------------------------------------------------------- */

  GRADES: [
    { grade: "A1", min: 91, max: 100 },
    { grade: "A2", min: 81, max: 90 },
    { grade: "B1", min: 71, max: 80 },
    { grade: "B2", min: 61, max: 70 },
    { grade: "C1", min: 51, max: 60 },
    { grade: "C2", min: 41, max: 50 },
    { grade: "D",  min: 33, max: 40 },
    { grade: "E",  min: 0,  max: 32 }
  ],


  /* -------------------------------------------------------
     07. DATABASE CONFIGURATION
  ------------------------------------------------------- */

  DATABASE: {
    PROVIDER: "Google Sheets",
    CONNECTION: "Google Apps Script",

    TABLES: {
      STUDENTS: "Students",
      MARKS: "Marks",
      ADMIN_USERS: "Admin_Users",
      ACTIVITY_LOGS: "Activity_Logs",
      SETTINGS: "Settings"
    },

    AUTO_GENERATE_RECORD_NO: true,
    RECORD_NO_SCOPE: "SHEET"
  },


  /* -------------------------------------------------------
     08. AUTHENTICATION CONFIGURATION
  ------------------------------------------------------- */

  AUTH: {
    ENABLED: true,

    LOGIN_REQUIRED_FOR_ADMIN: true,
    SESSION_TIMEOUT: 30,

    ALLOW_PUBLIC_ADMIN_REGISTRATION: false,

    PASSWORD_STORAGE: "SERVER_SIDE_HASH",
    VERIFY_LOGIN_ON_SERVER: true
  },


  /* -------------------------------------------------------
     09. API CONFIGURATION
  ------------------------------------------------------- */

  API: {
    BASE_URL: "",

    METHOD: "POST",
    RESPONSE_FORMAT: "JSON",

    TIMEOUT: 15000,

    ACTIONS: {
      LOGIN: "adminLogin",
      LOGOUT: "adminLogout",

      ADD_STUDENT: "addStudent",
      GET_STUDENTS: "getStudents",
      UPDATE_STUDENT: "updateStudent",
      DELETE_STUDENT: "deleteStudent",

      ADD_MARKS: "addMarks",
      GET_MARKS: "getMarks",
      UPDATE_MARKS: "updateMarks",
      DELETE_MARKS: "deleteMarks",

      GET_RESULT: "getResult",
      PUBLISH_RESULT: "publishResult",

      GET_SETTINGS: "getSettings",
      UPDATE_SETTINGS: "updateSettings"
    }
  },


  /* -------------------------------------------------------
     10. VALIDATION RULES
  ------------------------------------------------------- */

  VALIDATION: {
    REQUIRED_FIELDS: true,

    CHECK_STUDENT_ID: true,
    CHECK_ROLL_NUMBER: true,
    CHECK_MARKS_RANGE: true,

    PREVENT_EMPTY_SUBJECT: true,
    PREVENT_INVALID_DOB: true
  },


  /* -------------------------------------------------------
     11. USER INTERFACE
  ------------------------------------------------------- */

  UI: {
    RESPONSIVE: true,

    MOBILE_BREAKPOINT: 768,

    ENABLE_ANIMATIONS: true,
    ENABLE_LOADING_INDICATOR: true,

    CONFIRM_BEFORE_DELETE: true,
    SHOW_SUCCESS_MESSAGES: true,
    SHOW_ERROR_MESSAGES: true
  },


  /* -------------------------------------------------------
     12. PRINT & DOWNLOAD
  ------------------------------------------------------- */

  EXPORT: {
    PRINT_MARKSHEET: true,
    DOWNLOAD_MARKSHEET: true,

    FILE_FORMAT: "PDF",

    PRINT_ORIENTATION: "portrait"
  }

});


/* =========================================================
   13. HELPER FUNCTIONS
========================================================= */

/* Validate 11-digit Student ID */

function validateStudentID(id) {
  return APP_CONFIG.STUDENT.ID_PATTERN.test(
    String(id).trim()
  );
}


/* Validate Roll Number */

function validateRollNumber(roll) {
  const value = String(roll).trim();

  return (
    value.length >= APP_CONFIG.STUDENT.ROLL_MIN_LENGTH &&
    value.length <= APP_CONFIG.STUDENT.ROLL_MAX_LENGTH &&
    /^[0-9]+$/.test(value)
  );
}


/* Validate Marks */

function validateMarks(obtained, maximum) {
  const marks = Number(obtained);
  const max = Number(maximum);

  return (
    Number.isFinite(marks) &&
    Number.isFinite(max) &&
    max > 0 &&
    marks >= 0 &&
    marks <= max
  );
}


/* Calculate Percentage */

function calculatePercentage(obtained, maximum) {
  const marks = Number(obtained);
  const max = Number(maximum);

  if (!validateMarks(marks, max)) return null;

  return Number(((marks / max) * 100).toFixed(2));
}


/* Get Grade */

function getGrade(percentage) {
  const value = Number(percentage);

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return "Invalid";
  }

  const result = APP_CONFIG.GRADES.find(
    item => value >= item.min && value <= item.max
  );

  return result ? result.grade : "Invalid";
}


/* Check Passing Status */

function isPassed(percentage) {
  return Number(percentage) >=
    APP_CONFIG.RESULT.PASSING_PERCENTAGE;
}


/* =========================================================
   14. CONFIGURATION STATUS
========================================================= */

console.info(
  `${APP_CONFIG.APP.NAME} v${APP_CONFIG.APP.VERSION} Loaded`
);

if (APP_CONFIG.APP.DEBUG) {
  console.info("Application Configuration:", APP_CONFIG);
}
