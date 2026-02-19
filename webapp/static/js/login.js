(async () => {
    // If already authenticated, skip to dashboard
    if (await API.checkAuth()) {
        window.location.href = "/dashboard";
        return;
    }

    const form = document.getElementById("login-form");
    const btn = document.getElementById("submit-btn");
    const errEl = document.getElementById("error-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        btn.textContent = "Signing in...";
        btn.disabled = true;
        errEl.classList.add("hidden");

        const { ok, data } = await API.post("/api/login", {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        });

        if (ok && data.success) {
            window.location.href = "/dashboard";
        } else {
            errEl.textContent = data.error || "Login failed. Check your credentials.";
            errEl.classList.remove("hidden");
            btn.textContent = "Sign In";
            btn.disabled = false;
        }
    });
})();
