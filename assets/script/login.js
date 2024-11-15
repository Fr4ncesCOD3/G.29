// gestione login e register
document.getElementById("loginBtn").addEventListener("click", function () {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  this.classList.add("active");
  document.getElementById("registerBtn").classList.remove("active");
});

document.getElementById("registerBtn").addEventListener("click", function () {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  this.classList.add("active");
  document.getElementById("loginBtn").classList.remove("active");
});
