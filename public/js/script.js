// Mobile nav toggle (optional – hide/show .nav-menu if you add CSS for mobile)
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
    });
  }

  // Password reveal toggles
  document.querySelectorAll(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
        btn.innerHTML = input.type === "password"
          ? '<i class="fas fa-eye"></i>'
          : '<i class="fas fa-eye-slash"></i>';
      }
    });
  });

  // Simple password strength demo
  const pwd = document.getElementById("password");
  const fill = document.querySelector(".strength-fill");
  const text = document.querySelector(".strength-text");

  function evaluateStrength(val) {
    let score = 0;
    if (!val) return 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return Math.min(score, 4);
  }

  if (pwd && fill && text) {
    pwd.addEventListener("input", () => {
      const s = evaluateStrength(pwd.value);
      const widths = ["0%", "25%", "50%", "75%", "100%"];
      const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
      fill.style.width = widths[s];
      fill.style.background = s < 2 ? "#ef4444" : s < 3 ? "#f59e0b" : "#10b981";
      text.textContent = `Password strength: ${labels[s]}`;
    });
  }
});
