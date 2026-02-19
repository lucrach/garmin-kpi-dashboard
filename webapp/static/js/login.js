(async () => {
    // If already authenticated, skip to dashboard
    if (await API.checkAuth()) {
        window.location.href = "/dashboard";
        return;
    }

    const loginForm = document.getElementById("login-form");
    const mfaSection = document.getElementById("mfa-section");
    const mfaForm = document.getElementById("mfa-form");
    const submitBtn = document.getElementById("submit-btn");
    const mfaBtn = document.getElementById("mfa-btn");
    const errEl = document.getElementById("error-message");

    let pendingId = null;

    function showError(msg) {
        errEl.textContent = msg;
        errEl.classList.remove("hidden");
    }

    function hideError() {
        errEl.classList.add("hidden");
    }

    function showMfaStep() {
        loginForm.classList.add("hidden");
        mfaSection.classList.remove("hidden");
        document.getElementById("mfa-code").focus();
    }

    function showLoginStep() {
        mfaSection.classList.add("hidden");
        loginForm.classList.remove("hidden");
        hideError();
        pendingId = null;
    }

    // Login form submit
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.textContent = "Signing in...";
        submitBtn.disabled = true;
        hideError();

        const { ok, data } = await API.post("/api/login", {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        });

        if (data.needs_mfa) {
            pendingId = data.pending_id;
            submitBtn.textContent = "Sign In";
            submitBtn.disabled = false;
            showMfaStep();
            return;
        }

        if (ok && data.success) {
            window.location.href = "/dashboard";
        } else {
            showError(data.error || "Login failed. Check your credentials.");
            submitBtn.textContent = "Sign In";
            submitBtn.disabled = false;
        }
    });

    // MFA form submit
    mfaForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        mfaBtn.textContent = "Verifying...";
        mfaBtn.disabled = true;
        hideError();

        const { ok, data } = await API.post("/api/mfa", {
            pending_id: pendingId,
            code: document.getElementById("mfa-code").value.trim(),
        });

        if (ok && data.success) {
            window.location.href = "/dashboard";
        } else {
            showError(data.error || "Invalid code. Please try again.");
            mfaBtn.textContent = "Verify";
            mfaBtn.disabled = false;
        }
    });

    // Back to login button
    document.getElementById("mfa-back").addEventListener("click", showLoginStep);
})();
