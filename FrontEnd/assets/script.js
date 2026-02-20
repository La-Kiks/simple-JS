const API_BASE_URL = "http://localhost:5678/api";

const gallery = document.getElementById("gallery");
const filtersContainer = document.getElementById("filters");
// const filterButtons = document.querySelectorAll("#filters button");
const loginLink = document.getElementById("login-link");
const token = sessionStorage.getItem("token");
const isLoggedIn = !!token;

let works = [];

function displayWorks(worksToDisplay) {
  gallery.innerHTML = "";

  const fragment = document.createDocumentFragment();

  worksToDisplay.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.append(img, figcaption);
    fragment.appendChild(figure);
  });

  gallery.appendChild(fragment);

  console.log("Display works.");
}

async function fetchThenDisplayWorks() {
  try {
    const response = await fetch(API_BASE_URL + "/works");
    works = await response.json();

    displayWorks(works);
  } catch (e) {
    console.error("Error : ", e);
  }
}

async function fetchThenDisplayCategories() {
  try {
    const response = await fetch(API_BASE_URL + "/categories");
    const categories = await response.json();

    filtersContainer.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.dataset.category = "all";
    allButton.classList.add("selected");

    filtersContainer.appendChild(allButton);

    categories.forEach((category) => {
      const button = document.createElement("button");

      button.textContent = category.name;
      button.dataset.category = category.id;

      filtersContainer.appendChild(button);
    });

    const filterButtons = document.querySelectorAll("#filters button");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => {
          btn.classList.remove("selected");
        });

        button.classList.add("selected");

        filterWorksByCategory(button.dataset.category);
      });
    });
  } catch (e) {
    console.error("Impossible de récupérer les catégories.", e);
  }
}

async function loadCategories(categorySelect) {
  try {
    const response = await fetch(API_BASE_URL + "/categories");
    const categories = await response.json();

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    console.log("Load categories.");
  } catch (e) {
    console.error("Error : ", e);
  }
}

function filterWorksByCategory(categoryId) {
  if (categoryId === "all") {
    displayWorks(works);
    return;
  }

  const filteredWorks = works.filter((work) => {
    return work.categoryId === Number(categoryId);
  });

  displayWorks(filteredWorks);
}

function displayWorksInModal(works, modalGallery) {
  modalGallery.innerHTML = "";

  const fragment = document.createDocumentFragment();

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-work");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.dataset.id = work.id;

    const trashIcon = document.createElement("img");
    trashIcon.src = "assets/icons/white-trash-icon.svg";
    trashIcon.alt = "trash icon";

    deleteBtn.appendChild(trashIcon);
    figure.append(img, deleteBtn);
    fragment.appendChild(figure);
  });

  modalGallery.appendChild(fragment);

  console.log("Display works in modal.");
}

function handleLogout() {
  if (token) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      window.location.reload();
    });
  }
}

function updateAdminUI() {
  filtersContainer.hidden = isLoggedIn;

  if (isLoggedIn) {
    createModal();

    const titleContainer = document.querySelector(".portfolio-title-container");
    const editBtn = createEditButton();
    titleContainer.appendChild(editBtn);

    const modal = document.getElementById("modal");
    const editBtnContainer = document.querySelector(".edit-btn-container");
    const editHeader = document.querySelector(".edition-header");
    const closeModalBtn = document.getElementById("close-modal");
    const modalGallery = document.getElementById("modal-gallery");
    const modalGalleryView = document.getElementById("modal-gallery-view");
    const modalAddView = document.getElementById("modal-add-view");
    const fileInput = document.getElementById("image");
    const previewImg = document.getElementById("preview-img");
    const uploadLabel = document.querySelector(".upload-label");
    const previewContainer = document.querySelector(".image-preview");
    const form = document.getElementById("add-work-form");
    const submitBtn = form.querySelector("button[type='submit']");
    const categorySelect = document.getElementById("category");
    const titleInput = document.getElementById("title");

    // Executions
    editBtnContainer.hidden = !isLoggedIn;
    editHeader.hidden = !isLoggedIn;
    loadCategories(categorySelect);
    displayWorksInModal(works, modalGallery);

    function openModal() {
      modal.hidden = false;
    }

    function closeModal() {
      modal.hidden = true;
    }

    // Events
    editBtnContainer.addEventListener("click", openModal);

    closeModalBtn.addEventListener("click", closeModal);

    modalGallery.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest(".delete-btn");
      if (!deleteBtn) return;

      const workId = deleteBtn.dataset.id;

      const confirmDelete = confirm(
        "Voulez-vous vraiment supprimer ce projet?",
      );

      if (!confirmDelete) return;

      try {
        const response = await fetch(API_BASE_URL + `/works/${workId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erreur suppression");

        await fetchThenDisplayWorks();
        displayWorksInModal(works, modalGallery);
      } catch (e) {
        console.error(e);
      }
    });

    document.getElementById("add-work-btn").addEventListener("click", () => {
      modalGalleryView.hidden = true;
      modalAddView.hidden = false;
    });

    document.getElementById("back-btn").addEventListener("click", () => {
      modalGalleryView.hidden = false;
      modalAddView.hidden = true;
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Veuillez séléctionner une image");
        fileInput.value = "";
        return;
      }

      const imageUrl = URL.createObjectURL(file);

      previewImg.src = imageUrl;

      uploadLabel.hidden = true;
      previewContainer.hidden = false;
    });

    form.addEventListener("input", () => {
      if (!form.checkValidity()) return;
      submitBtn.classList.remove("disabled");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) return;

      const formData = new FormData();
      formData.append("image", fileInput.files[0]);
      formData.append("title", titleInput.value.trim());
      formData.append("category", categorySelect.value);

      try {
        const response = await fetch(API_BASE_URL + "/works", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l’ajout du projet");
        }

        console.log("Work ajouté.");

        form.reset();
        submitBtn.classList.add("disabled");
        resetPreview(fileInput, previewImg, previewContainer, uploadLabel);

        await fetchThenDisplayWorks();
        displayWorksInModal(works, modalGallery);
      } catch (e) {
        console.error("Error : ", e);
      }
    });
  }
}

function createEl(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.id) el.id = options.id;
  if (options.className) el.className = options.className;
  if (options.text) el.textContent = options.text;
  if (options.hidden) el.hidden = true;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  return el;
}

function createFormGroup(labelText, id, type) {
  const group = document.createElement("div");
  group.className = "form-group";

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = labelText;

  let field;

  if (type === "select") {
    field = document.createElement("select");
    field.id = id;
    field.required = true;

    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Choisir une catégorie";
    field.appendChild(option);
  } else {
    field = document.createElement("input");
    field.type = type;
    field.id = id;
    field.required = true;
  }

  group.append(label, field);
  return group;
}

function createEditButton() {
  const container = document.createElement("div");
  container.classList.add("edit-btn-container");

  const icon = document.createElement("img");
  icon.src = "assets/icons/edition-icon-black.svg";
  icon.alt = "Edition Icon";

  const button = document.createElement("button");
  button.id = "edit-btn";
  button.textContent = "modifier";

  container.append(icon, button);

  return container;
}

function createModal() {
  const modal = createEl("div", { id: "modal", hidden: true });
  const modalContent = createEl("div", { className: "modal-content" });

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-modal";
  closeBtn.className = "modal-close";

  const closeIcon = document.createElement("img");
  closeIcon.src = "assets/icons/xmark.svg";
  closeIcon.alt = "Fermer le modal";

  closeBtn.appendChild(closeIcon);

  closeBtn.appendChild(closeIcon);

  modalContent.appendChild(closeBtn);

  const galleryView = createEl("div", {
    id: "modal-gallery-view",
    className: "modal-view",
  });
  const galleryTitle = createEl("h2", { text: "Galerie photo" });
  const modalGallery = createEl("div", {
    id: "modal-gallery",
    className: "modal-gallery",
  });
  const addWorkBtn = createEl("button", {
    id: "add-work-btn",
    className: "primary-btn",
    text: "Ajouter une photo",
  });

  galleryView.append(galleryTitle, modalGallery, addWorkBtn);

  const addView = createEl("div", {
    id: "modal-add-view",
    className: "modal-view",
    hidden: true,
  });

  const backBtn = document.createElement("button");
  backBtn.id = "back-btn";
  backBtn.className = "back-btn";

  const backIcon = document.createElement("img");
  backIcon.src = "assets/icons/arrow-left.svg";
  backIcon.alt = "Retour";

  backBtn.appendChild(backIcon);

  backBtn.setAttribute("aria-label", "Retour");

  const addTitle = createEl("h2", { text: "Ajout photo" });
  const form = createEl("form", { id: "add-work-form" });
  const uploadBox = createEl("div", { className: "upload-box" });
  const fileInput = createEl("input", {
    id: "image",
    attrs: {
      type: "file",
      accept: "image/*",
      required: true,
      hidden: true,
    },
  });
  const uploadLabel = createEl("label", {
    className: "upload-label",
    attrs: { for: "image" },
  });
  const uploadIcon = createEl("img", {
    className: "upload-icon",
    attrs: {
      src: "assets/icons/upload-icon.svg",
      alt: "Upload icon",
    },
  });
  const uploadText = createEl("span", {
    className: "upload-text",
    text: "+ Ajouter photo",
  });
  const uploadHint = createEl("span", {
    className: "upload-hint",
    text: "jpg, png : 4mo max",
  });

  uploadLabel.append(uploadIcon, uploadText, uploadHint);

  const previewContainer = createEl("div", {
    className: "image-preview",
    hidden: true,
  });

  const previewImg = createEl("img", {
    id: "preview-img",
    attrs: { alt: "Preview" },
  });

  previewContainer.appendChild(previewImg);
  uploadBox.append(fileInput, uploadLabel, previewContainer);

  const titleGroup = createFormGroup("Titre", "title", "text");
  const categoryGroup = createFormGroup("Catégorie", "category", "select");
  const spacer = createEl("div", { className: "spacer" });

  const submitBtn = createEl("button", {
    className: "primary-btn disabled",
    text: "Valider",
    attrs: { type: "submit" },
  });

  form.append(uploadBox, titleGroup, categoryGroup, spacer, submitBtn);
  addView.append(backBtn, addTitle, form);

  modalContent.append(galleryView, addView);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  console.log("Modal created.");
}

function resetPreview(fileInput, previewImg, previewContainer, uploadLabel) {
  fileInput.value = "";
  previewImg.src = "";
  previewContainer.hidden = true;
  uploadLabel.hidden = false;
}

// Events :

// Execution :
await fetchThenDisplayWorks();
fetchThenDisplayCategories();
updateAdminUI();
handleLogout();
