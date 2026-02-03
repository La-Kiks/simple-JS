// |sophie.bluel@test.tld|S0phie|

const API_BASE_URL = "http://localhost:5678/api";

const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(API_BASE_URL + "/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Identifiants incorrects");
    }

    const data = await response.json();

    console.log("data ", data);

    localStorage.setItem("token", data.token);

    window.location.href = "index.html";
  } catch (e) {
    errorMessage.textContent = e.message;
  }
});
