const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// --- Load emissions data ---
const emissions = require(path.join(__dirname, "data", "emissions.json"));

// Helper: filter emissions based on query params
function filterEmissions({ country, sector, startYear, endYear }) {
  let filtered = emissions;

  if (country && country !== "All") {
    filtered = filtered.filter((d) => d.country === country);
  }

  if (sector && sector !== "All") {
    filtered = filtered.filter((d) => d.sector === sector);
  }

  if (startYear && endYear) {
    const s = parseInt(startYear, 10);
    const e = parseInt(endYear, 10);
    filtered = filtered.filter((d) => d.year >= s && d.year <= e);
  }

  return filtered;
}

// Helper: summarize a given set of data rows
function summarizeData(contextData = []) {
  if (!contextData || contextData.length === 0) {
    return "No data available for the current filters.";
  }

  const total = contextData.reduce((sum, d) => sum + d.emissions, 0);

  const bySector = {};
  contextData.forEach((d) => {
    bySector[d.sector] = (bySector[d.sector] || 0) + d.emissions;
  });

  const sorted = Object.entries(bySector).sort((a, b) => b[1] - a[1]);
  const topSector = sorted[0]?.[0];

  return `Total emissions in this view are ${total.toFixed(
    2
  )} MtCO₂e. The highest emitting sector is ${topSector}.`;
}

// --- Basic test route ---
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// --- /api/data : returns filtered emissions data ---
app.get("/api/data", (req, res) => {
  try {
    const { country, sector, startYear, endYear } = req.query;
    const data = filterEmissions({ country, sector, startYear, endYear });
    res.json(data);
  } catch (err) {
    console.error("Error in /api/data:", err);
    res.status(500).json({ error: "Failed to load emissions data" });
  }
});

// --- small helper to fetch external info (Wikipedia example) ---
async function fetchWebInfo() {
  try {
    // Simple static page related to emissions. You can improve later.
    const resp = await axios.get(
      "https://en.wikipedia.org/api/rest_v1/page/summary/Greenhouse_gas"
    );
    return resp.data.extract?.slice(0, 600) || "No external info available.";
  } catch (e) {
    console.error("Error fetching web info:", e.message);
    return "Could not fetch external info right now.";
  }
}

// --- helper: real-time UK carbon intensity (Great Britain grid) ---
async function fetchUkCarbonIntensity() {
  try {
    const resp = await axios.get("https://api.carbonintensity.org.uk/intensity");
    const current = resp.data?.data?.[0];

    if (!current) {
      return "Real-time grid carbon intensity data is temporarily unavailable.";
    }

    const value =
      current.intensity?.actual ?? current.intensity?.forecast ?? "unknown";
    const index = current.intensity?.index || "unknown";

    return `Right now, the electricity grid carbon intensity in Great Britain is about ${value} gCO₂/kWh (${index}).`;
  } catch (e) {
    console.error("Error fetching UK carbon intensity:", e.message);
    return "Real-time grid carbon intensity data is temporarily unavailable.";
  }
}

// --- /api/realtime : expose UK carbon intensity for frontend KPI card ---
app.get("/api/realtime", async (req, res) => {
  try {
    const resp = await axios.get("https://api.carbonintensity.org.uk/intensity");
    const current = resp.data?.data?.[0];

    if (!current) {
      return res.status(500).json({ error: "No real-time data available" });
    }

    const result = {
      from: current.from,
      to: current.to,
      intensity:
        current.intensity?.actual ?? current.intensity?.forecast ?? null,
      forecast: current.intensity?.forecast ?? null,
      index: current.intensity?.index ?? null,
    };

    res.json(result);
  } catch (err) {
    console.error("Error in /api/realtime:", err.message);
    res.status(500).json({ error: "Failed to fetch real-time data" });
  }
});

// --- /api/chat : combines data summary + real-time intensity + web info ---
app.post("/api/chat", async (req, res) => {
  try {
    const { question, contextData } = req.body;

    // Use contextData from frontend if provided; else use all emissions
    const dataToUse =
      Array.isArray(contextData) && contextData.length > 0
        ? contextData
        : emissions;

    const dataSummary = summarizeData(dataToUse);
    const webSummary = await fetchWebInfo();
    const realtimeNote = await fetchUkCarbonIntensity();

    const answer = `
Based on the dashboard data:
${dataSummary}

${realtimeNote}

Additional context from the internet about greenhouse gas emissions:
${webSummary}

Your question was: ${question}
    `;

    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});