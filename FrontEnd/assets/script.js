const API_BASE_URL = "http://localhost:5678/api";

const gallery = document.getElementById("gallery");
const filtersContainer = document.getElementById("filters");
const filterButtons = document.querySelectorAll("#filters button");
const loginLink = document.getElementById("login-link");
const token = localStorage.getItem("token");
const isLoggedIn = !!token;
const modal = document.getElementById("modal");
const editBtnContainer = document.querySelector(".edit-btn-container");
const editHeader = document.querySelector(".edition-header");
const closeModalBtn = document.getElementById("close-modal");
const modalGallery = document.getElementById("modal-gallery");
const modalGalleryView = document.getElementById("modal-gallery-view");
const modalAddView = document.getElementById("modal-add-view");

let works = [];

function displayWorks(worksToDisplay) {
  gallery.innerHTML = "";

  worksToDisplay.forEach((work) => {
    gallery.innerHTML += `
        <figure>
					<img src="${work.imageUrl}" alt="${work.title}">
					<figcaption>${work.title}</figcaption>
				</figure>
        `;
  });
}

async function fetchWorks() {
  try {
    const response = await fetch(API_BASE_URL + "/works");
    works = await response.json();

    displayWorks(works);
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

function displayWorksInModal(works) {
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    modalGallery.innerHTML += `
      <figure class="modal-work">
        <img src="${work.imageUrl}" alt="${work.title}">
        <button class="delete-btn" data-id="${work.id}">
        <img src="assets/icons/white-trash-icon.svg" alt="trash icon">
        </button>
      </figure>
    `;
  });
}

function handleLogout() {
  if (token) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

function updateAdminUI() {
  editBtnContainer.hidden = !isLoggedIn;
  editHeader.hidden = !isLoggedIn;
  filtersContainer.hidden = isLoggedIn;
}

function openModal() {
  modal.hidden = false;
  displayWorksInModal(works);
}

function closeModal() {
  modal.hidden = true;
}

// Events :
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    filterWorksByCategory(button.dataset.category);
  });
});

editBtnContainer.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

modalGallery.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const workId = e.target.dataset.id;

  try {
    const response = await fetch(API_BASE_URL + `/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Erreur suppression");

    await fetchWorks();
    displayWorks(works);
    displayWorksInModal(works);
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

// Execution :
fetchWorks();
handleLogout();
updateAdminUI();
