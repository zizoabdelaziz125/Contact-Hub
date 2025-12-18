let contacts = [];
let currentEditId = null;
let ValidationRules = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[A-Za-z\s\u0600-\u06FF]+$/,
    message: "Name should contain only letters and spaces (2-50 characters)",
  },
  phone: {
    pattern: /^(010|011|012|015)[0-9]{8}$/,
    message: "Please enter a valid Egyptian phone number",
  },
  email: {
    pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
    message: "Please enter a valid email address",
  },
};

// Initialize
function init() {
  contacts = loadContacts(); // load saved contacts.
  renderContacts();
  updateStats();
  attachEventListeners();
}

// Load contacts from storage
function loadContacts() {
  const saved = localStorage.getItem("contacts");
  return saved ? JSON.parse(saved) : [];
}

// Save contacts to storage
function saveContacts() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Attach event listeners
function attachEventListeners() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchInContacts(e.target.value);
  });

  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveContact();
  });

  document
    .getElementById("contactModal")
    .addEventListener("hidden.bs.modal", () => {
      resetForm();
    });
}

// Generate avatar with gradient
function generateAvatar(name) {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  ];
  const initial = name.charAt(0).toUpperCase();
  const colorIndex = initial.charCodeAt(0) % colors.length;
  return { initial, gradient: colors[colorIndex] };
}

// $.get({
//     url: 'https://forkify-api.herokuapp.com/api/search?q=pizza',
//     success: function (data) {
//         console.log("success");
//     },
//     error: function (msg) {
//         console.log("error");
//     }
// });

// template.content
// template => has a property named "content"
// content (DocumentFragment) => hidden container that holds the template content
// This content is NOT in the page - it exists in memory only

// element.cloneNode(true)
// cloneNode() - creates a copy of the element
// true - means "copy the element AND everything inside it (deep copy)"
// false - copies only the element without its children (shallow copy)

// Why clone?
// Without cloning, you can only use the template ONCE
// With cloning, you can use the same template multiple times

// Create contact card from template
function createContactCard(contact) {
  const template = document.getElementById("contactCardTemplate");
  const clone = template.content.cloneNode(true);
  const avatar = generateAvatar(contact.name);

  // Avatar
  const avatarEl = clone.querySelector("[data-avatar]");
  avatarEl.style.background = avatar.gradient;
  clone.querySelector("[data-initial]").textContent = avatar.initial;

  // Badges
  if (contact.isFavorite) {
    clone.querySelector("[data-favorite-badge]").style.display = "flex";
  }
  if (contact.isEmergency) {
    clone.querySelector("[data-emergency-badge]").style.display = "flex";
  }

  // Basic info
  clone.querySelector("[data-name]").textContent = contact.name;
  clone.querySelector("[data-phone]").textContent = contact.phone;

  // Details section
  const detailsSection = clone.querySelector("[data-details]");
  let hasDetails = false;

  if (contact.email) {
    const emailItem = clone.querySelector("[data-email-item]");
    emailItem.style.display = "flex";
    clone.querySelector("[data-email]").textContent = contact.email;
    hasDetails = true;
  }

  if (contact.address) {
    const addressItem = clone.querySelector("[data-address-item]");
    addressItem.style.display = "flex";
    clone.querySelector("[data-address]").textContent = contact.address;
    hasDetails = true;
  }

  if (hasDetails) {
    detailsSection.style.display = "block";
  }

  // Tags section
  const tagsSection = clone.querySelector("[data-tags]");
  let hasTags = false;

  if (contact.group) {
    const groupTag = clone.querySelector("[data-group-tag]");
    groupTag.style.display = "inline-block";
    groupTag.textContent = contact.group;
    groupTag.classList.add(contact.group);
    hasTags = true;
  }

  if (contact.notes) {
    const notesTag = clone.querySelector("[data-notes-tag]");
    notesTag.style.display = "inline-block";
    notesTag.title = contact.notes;
    hasTags = true;
  }

  if (hasTags) {
    tagsSection.style.display = "flex";
  }

  // Action buttons
  clone.querySelector("[data-call-btn]").onclick = () =>
    callContact(contact.phone);

  //email btn
  if (contact.email) {
    const emailBtn = clone.querySelector("[data-email-btn]");
    emailBtn.style.display = "inline-flex";
    emailBtn.onclick = () => emailContact(contact.email);
  }

  //favorite btn
  const favoriteBtn = clone.querySelector("[data-favorite-btn]");
  const favoriteIcon = favoriteBtn.querySelector("i");
  if (contact.isFavorite) {
    favoriteBtn.classList.add("active");
    favoriteIcon.classList.remove("far");
    favoriteIcon.classList.add("fas");
  }
  favoriteBtn.onclick = () => toggleFavorite(contact.id);

  //emergency btn
  const emergencyBtn = clone.querySelector("[data-emergency-btn]");
  const emergencyIcon = emergencyBtn.querySelector("i");
  if (contact.isEmergency) {
    emergencyBtn.classList.add("active");
    emergencyIcon.classList.remove("far", "fa-heart");
    emergencyIcon.classList.add("fas", "fa-heart-pulse");
  }
  emergencyBtn.onclick = () => toggleEmergency(contact.id);

  //edit btn
  clone.querySelector("[data-edit-btn]").onclick = () =>
    editContact(contact.id);

  //delete btn
  clone.querySelector("[data-delete-btn]").onclick = () =>
    deleteContact(contact.id);

  return clone;
}

// Create sidebar item from template
function createSidebarItem(contact, type) {
  const template = document.getElementById("sidebarItemTemplate");
  const clone = template.content.cloneNode(true);
  const avatar = generateAvatar(contact.name);

  const item = clone.querySelector(".sidebar-item");
  item.classList.add(type);

  const avatarEl = clone.querySelector("[data-avatar]");
  avatarEl.style.background = avatar.gradient;
  clone.querySelector("[data-initial]").textContent = avatar.initial;

  clone.querySelector("[data-name]").textContent = contact.name;
  clone.querySelector("[data-phone]").textContent = contact.phone;

  const quickCallBtn = clone.querySelector("[data-quick-call]");
  quickCallBtn.classList.add(type);
  quickCallBtn.onclick = (e) => {
    e.stopPropagation();
    callContact(contact.phone);
  };

  return clone;
}

// Render contacts to grid
function renderContacts(filtered = null) {
  const contactsToRender = filtered || contacts;
  const grid = document.getElementById("contactsGrid");
  grid.innerHTML = "";

  if (contactsToRender.length === 0) {
    const template = document.getElementById("emptyStateTemplate");
    const clone = template.content.cloneNode(true);
    grid.appendChild(clone);
  } else {
    contactsToRender.forEach((contact) => {
      const card = createContactCard(contact);
      grid.appendChild(card);
    });
  }

  renderSidebars();
}

// Render sidebars (favorites and emergency)
function renderSidebars() {
  // Favorites
  const favorites = contacts.filter((c) => c.isFavorite);
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    const template = document.getElementById("sidebarEmptyTemplate");
    const clone = template.content.cloneNode(true);
    clone.querySelector("[data-message]").textContent = "No favorites yet";
    favoritesList.appendChild(clone);
  } else {
    favorites.forEach((c) => {
      const item = createSidebarItem(c, "favorites");
      favoritesList.appendChild(item);
    });
  }

  // Emergency
  const emergency = contacts.filter((c) => c.isEmergency);
  const emergencyList = document.getElementById("emergencyList");
  emergencyList.innerHTML = "";

  if (emergency.length === 0) {
    const template = document.getElementById("sidebarEmptyTemplate");
    const clone = template.content.cloneNode(true);
    clone.querySelector("[data-message]").textContent = "No emergency contacts";
    emergencyList.appendChild(clone);
  } else {
    emergency.forEach((c) => {
      const item = createSidebarItem(c, "emergency");
      emergencyList.appendChild(item);
    });
  }
}

// Filter contacts by search term
function searchInContacts(searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    renderContacts();
    return;
  }

  const filtered = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(term) ||
      contact.phone.includes(term) ||
      (contact.email && contact.email.toLowerCase().includes(term))
  );

  renderContacts(filtered);
}

// Update statistics
function updateStats() {
  document.getElementById("totalCount").textContent = contacts.length;
  document.getElementById("allContacts").textContent = contacts.length;
  document.getElementById("favoritesCount").textContent = contacts.filter(
    (c) => c.isFavorite
  ).length;
  document.getElementById("emergencyCount").textContent = contacts.filter(
    (c) => c.isEmergency
  ).length;
}

// Save contact (add or edit)
function saveContact() {
  const name = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const address = document.getElementById("contactAddress").value.trim();
  const group = document.getElementById("contactGroup").value;
  const notes = document.getElementById("contactNotes").value.trim();
  const isFavorite = document.getElementById("contactFavorite").checked;
  const isEmergency = document.getElementById("contactEmergency").checked;

  if (!name) {
    Swal.fire({
      icon: "error",
      title: "Missing Name",
      text: "Please enter a name for the contact!",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  if (!phone) {
    Swal.fire({
      icon: "error",
      title: "Missing Phone",
      text: "Please enter a phone number!",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  const contact = {
    id: currentEditId || Date.now().toString(),
    name,
    phone,
    email,
    address,
    group,
    notes,
    isFavorite,
    isEmergency,
  };

  if (currentEditId) {
    const index = contacts.findIndex((c) => c.id === currentEditId);
    contacts[index] = contact;

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: contact.name + "has been updated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  } else {
    contacts.push(contact);

    Swal.fire({
      icon: "success",
      title: "Added!",
      text: contact.name + "has been added successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  saveContacts();
  renderContacts();
  updateStats();

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("contactModal")
  );
  modal.hide();

  resetForm();
}

// Edit contact
function editContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  currentEditId = id;

  //add contact data to modal
  document.getElementById("modalTitle").textContent = "Edit Contact";
  document.getElementById("contactName").value = contact.name;
  document.getElementById("contactPhone").value = contact.phone;
  document.getElementById("contactEmail").value = contact.email || "";
  document.getElementById("contactAddress").value = contact.address || "";
  document.getElementById("contactGroup").value = contact.group || "";
  document.getElementById("contactNotes").value = contact.notes || "";
  document.getElementById("contactFavorite").checked = contact.isFavorite;
  document.getElementById("contactEmergency").checked = contact.isEmergency;

  //show model
  const modal = new bootstrap.Modal(document.getElementById("contactModal"));
  modal.show();
}

// Delete contact
function deleteContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  Swal.fire({
    title: "Delete " + contact.name + " ?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      // contacts.remove(contact);
      contacts = contacts.filter((c) => c.id !== id);
      saveContacts();
      renderContacts();
      updateStats();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: contact.name + " has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

// Toggle favorite status
function toggleFavorite(id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    contact.isFavorite = !contact.isFavorite;
    saveContacts();
    renderContacts();
    updateStats();
  }
}

// Toggle emergency status
function toggleEmergency(id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    contact.isEmergency = !contact.isEmergency;
    saveContacts();
    renderContacts();
    updateStats();
  }
}

// Call contact
function callContact(phone) {
  window.location.href = `tel:${phone}`;
}

// Email contact
function emailContact(email) {
  window.location.href = `mailto:${email}`;
}

// Reset form
function resetForm() {
  currentEditId = null;
  document.getElementById("modalTitle").textContent = "Add New Contact";
  document.getElementById("contactForm").reset();
}

// Open add modal
function openAddModal() {
  resetForm();
}

function validate(input, rule) {
  const value = input.value.trim();
  const feedback = input.parentElement.querySelector(".invalid-feedback");

  if (!value) {
    input.classList.remove("is-valid", "is-invalid");
    feedback.classList.add("d-none");
    return;
  }

  const isValid = new RegExp(rule.pattern).test(value);

  input.classList.toggle("is-valid", isValid);
  input.classList.toggle("is-invalid", !isValid);

  feedback.textContent = rule.message;
  feedback.classList.toggle("d-none", isValid);
}

function isExist(input) {
  const value = input.value.trim();
  const feedback = input.parentElement.querySelector(".invalid-feedback");

  if (!value) {
    input.classList.remove("is-valid", "is-invalid");
    feedback.classList.add("d-none");
    return;
  }

  //find => retrn contact
  //some => return true || false, its like any(c => c.phone == value) in c#
  const exists = contacts.some((c) => c.phone === value);

  input.classList.toggle("is-valid", !exists);
  input.classList.toggle("is-invalid", exists);

  if (exists) {
    feedback.textContent = "Phone number already exists";
    feedback.classList.remove("d-none");
  } else {
    feedback.classList.add("d-none");
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const contactName = document.getElementById("contactName");
  const contactPhone = document.getElementById("contactPhone");
  const contactEmail = document.getElementById("contactEmail");

  contactName.addEventListener("keyup", () =>
    validate(contactName, ValidationRules.name)
  );
  contactPhone.addEventListener("keyup", () => {
    validate(contactPhone, ValidationRules.phone);
    isExist(contactPhone);
  });
  contactEmail.addEventListener("keyup", () =>
    validate(contactEmail, ValidationRules.email)
  );

  init();
});
