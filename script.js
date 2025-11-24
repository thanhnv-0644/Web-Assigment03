let users = [];
let currentPage = 1;
const pageSize = 5;

// --------------------------- FETCH USERS -----------------------------------
async function fetchUsers() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    users = await res.json();
    renderTable();
    renderPagination();
  } catch (err) {
    console.error("Error fetching users:", err);
    alert("Error: " + err.message);
  }
}

// --------------------------- GET FILTERED USERS -----------------------------------
function getFilteredUsers() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  return users.filter((u) => u.name.toLowerCase().includes(searchValue));
}

// --------------------------- RENDER TABLE -----------------------------------
function renderTable() {
  const tbody = document.getElementById("userTable");

  // Search filter
  const filtered = getFilteredUsers();

  // Pagination
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = paginated
    .map(
      (u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>
          <button onclick="editUser(${u.id})">Edit</button>
          <button onclick="deleteUser(${u.id})">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

// --------------------------- PAGINATION -----------------------------------
function renderPagination() {
  const filtered = getFilteredUsers();
  const total = filtered.length;
  const pages = Math.ceil(total / pageSize);

  const container = document.getElementById("pagination");
  container.innerHTML = "";

  if (pages <= 1) return;

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => {
      currentPage--;
      renderTable();
      renderPagination();
    };
    container.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.fontWeight = i === currentPage ? "bold" : "normal";
    btn.onclick = () => {
      currentPage = i;
      renderTable();
      renderPagination();
    };
    container.appendChild(btn);
  }

  // Next button
  if (currentPage < pages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => {
      currentPage++;
      renderTable();
      renderPagination();
    };
    container.appendChild(nextBtn);
  }
}

// --------------------------- CREATE & UPDATE USER ---------------------------
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    alert("Please fill in all fields");
    return;
  }

  const newUser = { name, email, phone };

  try {
    if (id) {
      // ---------------- UPDATE ----------------
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(newUser),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      // update UI manually
      const index = users.findIndex((u) => u.id == id);
      if (index !== -1) {
        users[index] = { ...users[index], ...newUser };
      }

      alert("Updated successfully");
    } else {
      // ---------------- CREATE ----------------
      const res = await fetch(`https://jsonplaceholder.typicode.com/users`, {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const created = await res.json();
      // Generate a unique ID for local tracking (since API returns id: 11)
      created.id =
        users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : Date.now();

      users.push(created);
      alert("Created successfully");
    }

    resetForm();
    currentPage = 1; // Reset to first page
    renderTable();
    renderPagination();
  } catch (err) {
    console.error("Error saving user:", err);
    alert("Error: " + err.message);
  }
});

// --------------------------- EDIT USER -----------------------------------
function editUser(id) {
  const u = users.find((x) => x.id === id);
  if (!u) {
    alert("User not found");
    return;
  }

  document.getElementById("formTitle").textContent = "Edit User";
  document.getElementById("userId").value = u.id;
  document.getElementById("name").value = u.name;
  document.getElementById("email").value = u.email;
  document.getElementById("phone").value = u.phone;

  // Show cancel button
  document.getElementById("cancelBtn").style.display = "inline-block";

  // Scroll to form
  document.getElementById("userForm").scrollIntoView({ behavior: "smooth" });
}

// --------------------------- DELETE USER -----------------------------------
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // Update UI manually
    users = users.filter((u) => u.id !== id);

    // Adjust current page if needed
    const filtered = getFilteredUsers();
    const totalPages = Math.ceil(filtered.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }

    renderTable();
    renderPagination();

    alert("Deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Error: " + err.message);
  }
}

// --------------------------- RESET FORM -----------------------------------
function resetForm() {
  document.getElementById("formTitle").textContent = "Create User";
  document.getElementById("userId").value = "";
  document.getElementById("userForm").reset();
  document.getElementById("cancelBtn").style.display = "none";
}

// --------------------------- SEARCH EVENT -----------------------------------
document.getElementById("search").addEventListener("input", () => {
  currentPage = 1; // Reset to first page when searching
  renderTable();
  renderPagination();
});

// INIT
fetchUsers();
