const API = {
    async get(endpoint) {
        const res = await fetch(endpoint, { credentials: "same-origin" });
        if (res.status === 401) {
            window.location.href = "/";
            return null;
        }
        if (!res.ok) {
            const msg = `API error ${res.status} on ${endpoint}`;
            console.error(msg);
            throw new Error(msg);
        }
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

function daysAgo(n, from) {
    const d = from ? new Date(from + "T12:00:00") : new Date();
    d.setDate(d.getDate() - n);
    return formatDate(d);
}
