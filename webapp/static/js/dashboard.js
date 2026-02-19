(async () => {
    // Auth check
    if (!(await API.checkAuth())) {
        window.location.href = "/";
        return;
    }

    let currentDate = todayStr();
    const datePicker = document.getElementById("date-picker");
    const loadingEl = document.getElementById("loading");
    const errorBanner = document.getElementById("error-banner");
    const errorText = document.getElementById("error-text");
    datePicker.value = currentDate;

    function showError(msg) {
        errorText.textContent = msg;
        errorBanner.classList.remove("hidden");
    }

    function hideError() {
        errorBanner.classList.add("hidden");
    }

    // Initialize charts
    createSleepStagesChart("chart-sleep-stages");
    createLineChart("chart-body-battery", "Body Battery", C.blue, 0, 100);
    createLineChart("chart-stress", "Stress", C.red, 0, 100);
    createLineChart("chart-hrv", "HRV", C.green, 0, undefined);
    createLineChart("chart-spo2", "SpO2", C.cyan, 85, 100);
    createLineChart("chart-breathing", "Breathing Rate", C.purple, 8, 25);
    createBarChart("chart-sleep-trend", "Sleep Score", C.blue);
    createBarChart("chart-rhr-trend", "RHR", C.red);

    async function loadDay(dateStr) {
        currentDate = dateStr;
        datePicker.value = dateStr;
        loadingEl.classList.remove("hidden");

        hideError();

        try {
            // 7-day range ending on the selected date
            const trendStart = daysAgo(6, dateStr);

            // Fetch everything in parallel
            const [sleepSummary, sleepIntraday, stress, bodyBattery, hrv, breathing, dailyTrend, sleepTrend] =
                await Promise.all([
                    API.get(`/api/sleep/summary?start=${dateStr}&end=${dateStr}`),
                    API.get(`/api/sleep/intraday?date=${dateStr}`),
                    API.get(`/api/stress/intraday?date=${dateStr}`),
                    API.get(`/api/body-battery/intraday?date=${dateStr}`),
                    API.get(`/api/hrv/intraday?date=${dateStr}`),
                    API.get(`/api/breathing/intraday?date=${dateStr}`),
                    API.get(`/api/daily/summary?start=${trendStart}&end=${dateStr}`),
                    API.get(`/api/sleep/summary?start=${trendStart}&end=${dateStr}`),
                ]);

            // Summary cards
            renderSummaryCards(sleepSummary?.data?.[0]);

            // Sleep stages
            if (sleepIntraday?.data) {
                const stagePoints = sleepIntraday.data.filter(
                    (p) => p.SleepStageLevel !== null && p.SleepStageLevel !== undefined
                );
                updateSleepStagesChart("chart-sleep-stages", stagePoints);
            }

            // Intraday charts
            if (stress?.data) {
                updateLineChart(
                    "chart-stress",
                    stress.data
                        .filter((p) => p.stressLevel > 0)
                        .map((p) => ({ x: p.time, y: p.stressLevel }))
                );
            }
            if (bodyBattery?.data) {
                updateLineChart(
                    "chart-body-battery",
                    bodyBattery.data.map((p) => ({ x: p.time, y: p.BodyBatteryLevel }))
                );
            }
            if (hrv?.data) {
                updateLineChart(
                    "chart-hrv",
                    hrv.data
                        .filter((p) => p.hrvValue !== null && p.hrvValue > 0)
                        .map((p) => ({ x: p.time, y: p.hrvValue }))
                );
            }
            if (sleepIntraday?.data) {
                const spo2Points = sleepIntraday.data
                    .filter((p) => p.spo2Reading !== null && p.spo2Reading > 0)
                    .map((p) => ({ x: p.time, y: p.spo2Reading }));
                updateLineChart("chart-spo2", spo2Points);
            }
            if (breathing?.data) {
                updateLineChart(
                    "chart-breathing",
                    breathing.data
                        .filter((p) => p.BreathingRate !== null && p.BreathingRate > 0)
                        .map((p) => ({ x: p.time, y: p.BreathingRate }))
                );
            }

            // 7-day trends
            if (sleepTrend?.data) {
                const labels = sleepTrend.data.map((p) => p.time.split("T")[0].slice(5));
                const scores = sleepTrend.data.map((p) => p.sleepScore);
                updateBarChart("chart-sleep-trend", labels, scores);
            }
            if (dailyTrend?.data) {
                const labels = dailyTrend.data.map((p) => p.time.split("T")[0].slice(5));
                const rhrs = dailyTrend.data.map((p) => p.restingHeartRate);
                updateBarChart("chart-rhr-trend", labels, rhrs);
            }
        } catch (err) {
            console.error("Failed to load data:", err);
            showError("Failed to load data. Check that InfluxDB is running.");
        } finally {
            loadingEl.classList.add("hidden");
        }
    }

    function renderSummaryCards(sleep) {
        const cards = document.getElementById("summary-cards");
        if (!sleep) {
            cards.innerHTML = noDataCards();
            return;
        }
        const sleepH = sleep.sleepTimeSeconds
            ? (sleep.sleepTimeSeconds / 3600).toFixed(1)
            : "--";
        cards.innerHTML = [
            card("Sleep Score", sleep.sleepScore ?? "--", "blue"),
            card("Sleep", sleepH + "h", "purple"),
            card("Resting HR", (sleep.restingHeartRate ?? "--") + " bpm", "red"),
            card("HRV", (sleep.avgOvernightHrv ?? "--") + " ms", "green"),
            card("SpO2", (sleep.averageSpO2Value ?? "--") + "%", "cyan"),
            card("BB Change", formatBB(sleep.bodyBatteryChange), "yellow"),
        ].join("");
    }

    function card(title, value, color) {
        const colors = {
            blue:   "border-blue-500/30",
            purple: "border-purple-500/30",
            red:    "border-red-500/30",
            green:  "border-green-500/30",
            cyan:   "border-cyan-500/30",
            yellow: "border-yellow-500/30",
        };
        return `<div class="bg-gray-800 rounded-xl p-4 text-center border ${colors[color] || ""}">
            <div class="text-gray-400 text-xs uppercase tracking-wide">${title}</div>
            <div class="text-2xl font-bold text-white mt-1">${value}</div>
        </div>`;
    }

    function noDataCards() {
        return Array(6)
            .fill(
                `<div class="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
                    <div class="text-gray-500 text-xs uppercase">No data</div>
                    <div class="text-2xl font-bold text-gray-600 mt-1">--</div>
                </div>`
            )
            .join("");
    }

    function formatBB(val) {
        if (val === null || val === undefined) return "--";
        return (val > 0 ? "+" : "") + val;
    }

    // Navigation
    datePicker.addEventListener("change", () => loadDay(datePicker.value));

    document.getElementById("btn-today").addEventListener("click", () => loadDay(todayStr()));

    document.getElementById("btn-prev").addEventListener("click", () => {
        const d = new Date(currentDate + "T12:00:00"); // noon to avoid DST issues
        d.setDate(d.getDate() - 1);
        loadDay(formatDate(d));
    });

    document.getElementById("btn-next").addEventListener("click", () => {
        const d = new Date(currentDate + "T12:00:00");
        d.setDate(d.getDate() + 1);
        loadDay(formatDate(d));
    });

    document.getElementById("btn-logout").addEventListener("click", async () => {
        await API.post("/api/logout", {});
        window.location.href = "/";
    });

    // Initial load
    loadDay(currentDate);
})();
