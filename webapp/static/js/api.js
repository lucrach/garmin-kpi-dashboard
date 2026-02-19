const API = {
    async get(endpoint) {
        const res = await fetch(endpoint, { credentials: "same-origin" });
        if (res.status === 401) {
            window.location.href = "/";
            return null;
        }
        if (!res.ok) return null;
        return res.json();
    },

    async post(endpoint, body) {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(body),
        });
        return { ok: res.ok, data: await res.json() };
    },

    async checkAuth() {
        try {
            const res = await fetch("/api/auth-status", { credentials: "same-origin" });
            const data = await res.json();
            return data.authenticated === true;
        } catch {
            return false;
        }
    },
};

function formatDate(date) {
    return date.toISOString().split("T")[0];
}

function todayStr() {
    return formatDate(new Date());
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return formatDate(d);
}
