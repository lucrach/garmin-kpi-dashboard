// Color palette
const C = {
    blue:   { border: "rgba(59, 130, 246, 0.9)",  bg: "rgba(59, 130, 246, 0.15)" },
    green:  { border: "rgba(34, 197, 94, 0.9)",   bg: "rgba(34, 197, 94, 0.15)" },
    red:    { border: "rgba(239, 68, 68, 0.9)",   bg: "rgba(239, 68, 68, 0.15)" },
    yellow: { border: "rgba(234, 179, 8, 0.9)",   bg: "rgba(234, 179, 8, 0.15)" },
    purple: { border: "rgba(168, 85, 247, 0.9)",  bg: "rgba(168, 85, 247, 0.15)" },
    cyan:   { border: "rgba(6, 182, 212, 0.9)",   bg: "rgba(6, 182, 212, 0.15)" },
    orange: { border: "rgba(249, 115, 22, 0.9)",  bg: "rgba(249, 115, 22, 0.15)" },
};

// Dark theme defaults for all charts
const GRID_COLOR = "#374151";
const TICK_COLOR = "#9CA3AF";

const chartInstances = {};

// Shared dark theme options
const darkScaleOpts = (yMin, yMax) => ({
    x: {
        type: "time",
        time: { tooltipFormat: "HH:mm", displayFormats: { hour: "HH:mm", minute: "HH:mm" } },
        ticks: { color: TICK_COLOR, maxTicksLimit: 12 },
        grid: { color: GRID_COLOR },
    },
    y: {
        min: yMin,
        max: yMax,
        ticks: { color: TICK_COLOR },
        grid: { color: GRID_COLOR },
    },
});

function createLineChart(canvasId, label, color, yMin, yMax) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                label,
                borderColor: color.border,
                backgroundColor: color.bg,
                data: [],
                fill: true,
                pointRadius: 0,
                borderWidth: 1.5,
                tension: 0.3,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            scales: darkScaleOpts(yMin, yMax),
            plugins: { legend: { display: false } },
        },
    });
    chartInstances[canvasId] = chart;
    return chart;
}

function createBarChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label,
                backgroundColor: color.border,
                data: [],
                borderRadius: 4,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            scales: {
                x: { ticks: { color: TICK_COLOR }, grid: { color: GRID_COLOR } },
                y: { ticks: { color: TICK_COLOR }, grid: { color: GRID_COLOR } },
            },
            plugins: { legend: { display: false } },
        },
    });
    chartInstances[canvasId] = chart;
    return chart;
}

function createSleepStagesChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    const STAGE_COLORS = {
        deep:  "rgba(99, 102, 241, 0.9)",   // indigo
        light: "rgba(59, 130, 246, 0.9)",    // blue
        rem:   "rgba(168, 85, 247, 0.9)",    // purple
        awake: "rgba(249, 115, 22, 0.9)",    // orange
    };
    const chart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                { label: "Deep",  borderColor: STAGE_COLORS.deep,  backgroundColor: STAGE_COLORS.deep.replace("0.9", "0.2"),  data: [], fill: true, pointRadius: 0, borderWidth: 1.5, stepped: true },
                { label: "Light", borderColor: STAGE_COLORS.light, backgroundColor: STAGE_COLORS.light.replace("0.9", "0.2"), data: [], fill: true, pointRadius: 0, borderWidth: 1.5, stepped: true },
                { label: "REM",   borderColor: STAGE_COLORS.rem,   backgroundColor: STAGE_COLORS.rem.replace("0.9", "0.2"),   data: [], fill: true, pointRadius: 0, borderWidth: 1.5, stepped: true },
                { label: "Awake", borderColor: STAGE_COLORS.awake, backgroundColor: STAGE_COLORS.awake.replace("0.9", "0.2"), data: [], fill: true, pointRadius: 0, borderWidth: 1.5, stepped: true },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            scales: {
                x: {
                    type: "time",
                    time: { tooltipFormat: "HH:mm", displayFormats: { hour: "HH:mm" } },
                    ticks: { color: TICK_COLOR, maxTicksLimit: 12 },
                    grid: { color: GRID_COLOR },
                },
                y: {
                    min: 0, max: 4,
                    ticks: {
                        color: TICK_COLOR,
                        callback: (v) => ["Deep", "Light", "REM", "Awake"][v] || "",
                        stepSize: 1,
                    },
                    grid: { color: GRID_COLOR },
                },
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: TICK_COLOR, boxWidth: 12, padding: 8, font: { size: 11 } },
                },
            },
        },
    });
    chartInstances[canvasId] = chart;
    return chart;
}

function updateLineChart(canvasId, points) {
    const chart = chartInstances[canvasId];
    if (!chart) return;
    chart.data.datasets[0].data = points;
    chart.update("none");
}

function updateBarChart(canvasId, labels, values) {
    const chart = chartInstances[canvasId];
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update("none");
}

function updateSleepStagesChart(canvasId, stageData) {
    const chart = chartInstances[canvasId];
    if (!chart) return;
    // stageData is an array of { time, SleepStageLevel }
    // Stage levels: 0=deep, 1=light, 2=REM, 3=awake
    // We show each stage as a separate dataset, y = stage+1 when active, null otherwise
    const datasets = [[], [], [], []]; // deep, light, rem, awake
    for (const p of stageData) {
        const t = p.time;
        const stage = p.SleepStageLevel;
        if (stage === null || stage === undefined) continue;
        for (let i = 0; i < 4; i++) {
            datasets[i].push({ x: t, y: stage === i ? stage + 1 : null });
        }
    }
    for (let i = 0; i < 4; i++) {
        chart.data.datasets[i].data = datasets[i];
    }
    chart.update("none");
}
