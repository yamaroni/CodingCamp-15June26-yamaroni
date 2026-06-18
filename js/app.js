/* js/app.js — modules implemented in tasks 3–10 */

/* ============================================================
   GreetingModule — Task 3.1
   Displays current time (HH:MM), date ("Day, DD Month YYYY"),
   and a time-based greeting. Updates whenever the minute changes.
   ============================================================ */
var GreetingModule = (function () {

  var _lastRenderedMinute = -1;

  var _DAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];

  var _MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Returns zero-padded HH:MM string in 24-hour format.
   * @param {Date} date
   * @returns {string} e.g. "09:05", "23:45"
   */
  function _formatTime(date) {
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }

  /**
   * Returns date string in "Day, DD Month YYYY" format.
   * @param {Date} date
   * @returns {string} e.g. "Monday, 16 June 2025"
   */
  function _formatDate(date) {
    var dayName   = _DAYS[date.getDay()];
    var dd        = String(date.getDate()).padStart(2, '0');
    var monthName = _MONTHS[date.getMonth()];
    var yyyy      = date.getFullYear();
    return dayName + ', ' + dd + ' ' + monthName + ' ' + yyyy;
  }

  /**
   * Returns the appropriate greeting for the given hour (0–23).
   * @param {number} hours
   * @returns {string}
   */
  function _getGreeting(hours) {
    if (hours >= 0 && hours <= 11) return 'Good Morning';
    if (hours >= 12 && hours <= 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  /**
   * Reads the current time and writes greeting, time, and date to the DOM.
   */
  function _render() {
    var now = new Date();
    document.getElementById('greeting-text').textContent = _getGreeting(now.getHours());
    document.getElementById('time-display').textContent  = _formatTime(now);
    document.getElementById('date-display').textContent  = _formatDate(now);
    _lastRenderedMinute = now.getMinutes();
  }

  /**
   * Initialises the module: renders immediately, then polls every second
   * and re-renders only when the minute changes.
   */
  function init() {
    _render();
    setInterval(function () {
      var currentMinute = new Date().getMinutes();
      if (currentMinute !== _lastRenderedMinute) {
        _render();
      }
    }, 1000);
  }

  // Public API
  return { init: init };

}());
