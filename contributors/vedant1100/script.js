/**
 * Library Management System — demo
 * ---------------------------------
 * Fully client-side: no server, no real database.
 *  - "Login" is a mock check (any username + password "demo123").
 *  - The book catalog and the logged-in user's reservations live in
 *    sessionStorage, so they persist while you click around this page
 *    but disappear once the tab is closed — a "temporary" store, as
 *    requested. Reservations support full CRUD: Create (reserve a
 *    catalog book, or add a custom entry), Read (the table), Update
 *    (edit button -> modal), Delete (remove button).
 */
(function () {
  "use strict";

  var STORAGE = {
    session: "lms_session",
    catalog: "lms_catalog",
    reservations: "lms_reservations",
  };

  var DEFAULT_CATALOG = [
    { id: "b1", title: "Clean Code", author: "Robert C. Martin", genre: "Software", copies: 3 },
    { id: "b2", title: "The Pragmatic Programmer", author: "Hunt & Thomas", genre: "Software", copies: 2 },
    { id: "b3", title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", copies: 1 },
    { id: "b4", title: "1984", author: "George Orwell", genre: "Fiction", copies: 4 },
    { id: "b5", title: "Sapiens", author: "Yuval Noah Harari", genre: "History", copies: 2 },
    { id: "b6", title: "Atomic Habits", author: "James Clear", genre: "Self-help", copies: 0 },
    { id: "b7", title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", copies: 3 },
    { id: "b8", title: "Introduction to Algorithms", author: "CLRS", genre: "Software", copies: 1 },
  ];

  // ---------- DOM refs ----------
  var loginView = document.getElementById("login-view");
  var appView = document.getElementById("app-view");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var welcomeUser = document.getElementById("welcome-user");
  var logoutBtn = document.getElementById("logout-btn");

  var catalogGrid = document.getElementById("catalog-grid");
  var catalogSearch = document.getElementById("catalog-search");

  var reservationsBody = document.getElementById("reservations-body");
  var reservationCount = document.getElementById("reservation-count");
  var addReservationBtn = document.getElementById("add-reservation-btn");

  var modalOverlay = document.getElementById("reservation-modal");
  var modalTitle = document.getElementById("modal-title");
  var reservationForm = document.getElementById("reservation-form");
  var resIdField = document.getElementById("res-id");
  var resTitleField = document.getElementById("res-title");
  var resAuthorField = document.getElementById("res-author");
  var resDueField = document.getElementById("res-due");
  var resStatusField = document.getElementById("res-status");
  var resNotesField = document.getElementById("res-notes");
  var modalCancelBtn = document.getElementById("modal-cancel-btn");

  // ---------- Storage helpers ----------
  function loadJSON(key, fallback) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  function getCatalog() {
    return loadJSON(STORAGE.catalog, DEFAULT_CATALOG);
  }

  function setCatalog(catalog) {
    saveJSON(STORAGE.catalog, catalog);
  }

  function getReservations() {
    return loadJSON(STORAGE.reservations, []);
  }

  function setReservations(list) {
    saveJSON(STORAGE.reservations, list);
  }

  // ---------- Utils ----------
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(isoDate, days) {
    var d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function statusClass(status) {
    return "status-" + status.toLowerCase().replace(/\s+/g, "-");
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  // ---------- Auth ----------
  function currentUser() {
    return sessionStorage.getItem(STORAGE.session);
  }

  function login(username) {
    sessionStorage.setItem(STORAGE.session, username);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE.session);
    showLoginView();
  }

  function showLoginView() {
    loginView.hidden = false;
    appView.hidden = true;
    loginForm.reset();
    loginError.hidden = true;
  }

  function showAppView() {
    loginView.hidden = true;
    appView.hidden = false;
    welcomeUser.textContent = currentUser();
    renderCatalog();
    renderReservations();
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = document.getElementById("login-username").value.trim();
    var password = document.getElementById("login-password").value;

    if (!username || password !== "demo123") {
      loginError.textContent = username
        ? 'Wrong password. Hint: it\'s "demo123".'
        : "Please enter a username.";
      loginError.hidden = false;
      return;
    }

    login(username);
    showAppView();
  });

  logoutBtn.addEventListener("click", logout);

  // ---------- Catalog rendering ----------
  function renderCatalog() {
    var catalog = getCatalog();
    var query = (catalogSearch.value || "").toLowerCase().trim();

    var filtered = catalog.filter(function (book) {
      if (!query) return true;
      return (
        book.title.toLowerCase().indexOf(query) !== -1 ||
        book.author.toLowerCase().indexOf(query) !== -1 ||
        book.genre.toLowerCase().indexOf(query) !== -1
      );
    });

    catalogGrid.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("p");
      empty.style.color = "var(--text-muted)";
      empty.textContent = "No books match your search.";
      catalogGrid.appendChild(empty);
      return;
    }

    filtered.forEach(function (book) {
      var card = document.createElement("div");
      card.className = "lms-book";
      card.innerHTML =
        '<div class="lms-book-title">' + escapeHTML(book.title) + "</div>" +
        '<div class="lms-book-meta">' + escapeHTML(book.author) + " · " + escapeHTML(book.genre) + "</div>" +
        '<div class="lms-book-copies">' + book.copies + " cop" + (book.copies === 1 ? "y" : "ies") + " available</div>";

      var btn = document.createElement("button");
      btn.className = "btn btn-primary";
      btn.textContent = book.copies > 0 ? "Reserve" : "Unavailable";
      btn.disabled = book.copies <= 0;
      btn.addEventListener("click", function () {
        reserveBook(book.id);
      });

      card.appendChild(btn);
      catalogGrid.appendChild(card);
    });
  }

  catalogSearch.addEventListener("input", renderCatalog);

  // ---------- Reserve (Create, from catalog) ----------
  function reserveBook(bookId) {
    var catalog = getCatalog();
    var book = catalog.find(function (b) {
      return b.id === bookId;
    });
    if (!book || book.copies <= 0) return;

    book.copies -= 1;
    setCatalog(catalog);

    var reservations = getReservations();
    reservations.push({
      id: uid(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      reservedOn: todayISO(),
      dueDate: addDays(todayISO(), 14),
      status: "Reserved",
      notes: "",
    });
    setReservations(reservations);

    renderCatalog();
    renderReservations();
  }

  // ---------- Reservations table (Read) ----------
  function renderReservations() {
    var reservations = getReservations();
    reservationCount.textContent = String(reservations.length);
    reservationsBody.innerHTML = "";

    if (reservations.length === 0) {
      var row = document.createElement("tr");
      row.innerHTML =
        '<td colspan="7" style="text-align:center; color: var(--text-muted);">' +
        "No reservations yet — reserve a book from the catalog above." +
        "</td>";
      reservationsBody.appendChild(row);
      return;
    }

    reservations.forEach(function (res) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHTML(res.title) + "</td>" +
        "<td>" + escapeHTML(res.author) + "</td>" +
        "<td>" + escapeHTML(res.reservedOn) + "</td>" +
        "<td>" + escapeHTML(res.dueDate) + "</td>" +
        '<td><span class="lms-status ' + statusClass(res.status) + '">' + escapeHTML(res.status) + "</span></td>" +
        "<td>" + (res.notes ? escapeHTML(res.notes) : '<span style="color:var(--text-muted)">—</span>') + "</td>";

      var actionsTd = document.createElement("td");
      actionsTd.className = "lms-row-actions";

      var editBtn = document.createElement("button");
      editBtn.className = "btn btn-outline";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () {
        openModal(res);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "btn btn-outline";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", function () {
        deleteReservation(res.id);
      });

      actionsTd.appendChild(editBtn);
      actionsTd.appendChild(delBtn);
      tr.appendChild(actionsTd);
      reservationsBody.appendChild(tr);
    });
  }

  // ---------- Delete ----------
  function deleteReservation(id) {
    var reservations = getReservations();
    var target = reservations.find(function (r) {
      return r.id === id;
    });
    if (!target) return;

    if (!window.confirm('Cancel reservation for "' + target.title + '"?')) return;

    // Return the copy to the catalog if this reservation came from it.
    if (target.bookId) {
      var catalog = getCatalog();
      var book = catalog.find(function (b) {
        return b.id === target.bookId;
      });
      if (book) {
        book.copies += 1;
        setCatalog(catalog);
      }
    }

    reservations = reservations.filter(function (r) {
      return r.id !== id;
    });
    setReservations(reservations);

    renderCatalog();
    renderReservations();
  }

  // ---------- Modal (Create custom / Update) ----------
  function openModal(res) {
    reservationForm.reset();
    if (res) {
      modalTitle.textContent = "Edit reservation";
      resIdField.value = res.id;
      resTitleField.value = res.title;
      resAuthorField.value = res.author;
      resDueField.value = res.dueDate;
      resStatusField.value = res.status;
      resNotesField.value = res.notes || "";
    } else {
      modalTitle.textContent = "Add custom reservation";
      resIdField.value = "";
      resDueField.value = addDays(todayISO(), 14);
      resStatusField.value = "Reserved";
    }
    modalOverlay.hidden = false;
    resTitleField.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  addReservationBtn.addEventListener("click", function () {
    openModal(null);
  });

  modalCancelBtn.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  reservationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var id = resIdField.value;
    var data = {
      title: resTitleField.value.trim(),
      author: resAuthorField.value.trim(),
      dueDate: resDueField.value,
      status: resStatusField.value,
      notes: resNotesField.value.trim(),
    };
    if (!data.title || !data.author || !data.dueDate) return;

    var reservations = getReservations();

    if (id) {
      // Update
      reservations = reservations.map(function (r) {
        return r.id === id ? Object.assign({}, r, data) : r;
      });
    } else {
      // Create (custom, not tied to a catalog book)
      reservations.push(
        Object.assign(
          { id: uid(), bookId: null, reservedOn: todayISO() },
          data
        )
      );
    }

    setReservations(reservations);
    closeModal();
    renderReservations();
  });

  // ---------- Init ----------
  if (currentUser()) {
    showAppView();
  } else {
    showLoginView();
  }
})();
