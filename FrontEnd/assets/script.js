const API_BASE_URL = "http://localhost:5678/api";

const gallery = document.getElementById("gallery");
const filterButtons = document.querySelectorAll("#filters button");
const loginLink = document.getElementById("login-link");
const token = localStorage.getItem("token");

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
    console.log("Filter All");
    displayWorks(works);
    return;
  }

  const filteredWorks = works.filter((work) => {
    return work.categoryId === Number(categoryId);
  });

  displayWorks(filteredWorks);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterWorksByCategory(button.dataset.category);
  });
});

function handleLogout() {
  if (token) {
    loginLink.textContent = "Logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

// Execution :
fetchWorks();
handleLogout();
