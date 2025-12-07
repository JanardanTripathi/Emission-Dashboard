import { useEffect, useMemo, useState } from "react";
import { fetchEmissions, fetchRealtime } from "./services/api";
import ChatPanel from "./components/chat/ChatPanel";
import SectorBarChart from "./components/charts/SectorBarChart";

function App() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [country, setCountry] = useState("All");
  const [sector, setSector] = useState("All");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const [loading, setLoading] = useState(false);

  const [realtime, setRealtime] = useState(null);
  const [realtimeError, setRealtimeError] = useState("");

  // Load all data once to populate filters + initial view
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchEmissions();
        setAllData(res.data);
        setData(res.data);
        const years = [...new Set(res.data.map((d) => d.year))].sort();
        if (years.length > 0) {
          setStartYear(years[0]);
          setEndYear(years[years.length - 1]);
        }

        // Fetch real-time carbon intensity
        try {
          const rt = await fetchRealtime();
          setRealtime(rt.data);
        } catch (e) {
          console.error("Realtime fetch error:", e);
          setRealtimeError("Could not load real-time emissions signal.");
        }
      } catch (err) {
        console.error("Error loading emissions:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtered fetch when user changes filters
  useEffect(() => {
    const loadFiltered = async () => {
      if (!startYear || !endYear) return;
      setLoading(true);
      try {
        const res = await fetchEmissions({
          country,
          sector,
          startYear,
          endYear,
        });
        setData(res.data);
      } catch (err) {
        console.error("Error loading filtered data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFiltered();
  }, [country, sector, startYear, endYear]);

  const countries = useMemo(() => {
    const set = new Set(allData.map((d) => d.country));
    return ["All", ...Array.from(set)];
  }, [allData]);

  const sectors = useMemo(() => {
    const set = new Set(allData.map((d) => d.sector));
    return ["All", ...Array.from(set)];
  }, [allData]);

  const totalEmissions = useMemo(
    () => data.reduce((sum, d) => sum + d.emissions, 0),
    [data]
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          padding: "1rem",
          borderRight: "1px solid #ddd",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h2>Filters</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ width: "100%", padding: "0.3rem", marginTop: "0.2rem" }}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{ width: "100%", padding: "0.3rem", marginTop: "0.2rem" }}
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Start Year</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            style={{ width: "100%", padding: "0.3rem", marginTop: "0.2rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>End Year</label>
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            style={{ width: "100%", padding: "0.3rem", marginTop: "0.2rem" }}
          />
        </div>

        {loading && <p>Loading data...</p>}
      </aside>

      {/* Main + chat */}
      <main style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 2, padding: "1rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h1>Emissions Dashboard</h1>
            <p style={{ color: "#555" }}>
              Visualising emissions by country, sector and year.
            </p>
            <p style={{ color: "#777", fontSize: "0.85rem" }}>
              Use the filters on the left to explore emissions data.
              Ask questions in the chat panel to get explanations and external
              insights, including live grid carbon intensity for Great Britain.
            </p>
          </header>

          {/* KPI cards */}
          <section
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Total emissions for current filter */}
            <div
              style={{
                padding: "0.8rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "200px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1rem" }}>Total Emissions</h3>
              <p style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                {totalEmissions.toFixed(2)} MtCO₂e
              </p>
              <p style={{ fontSize: "0.8rem", color: "#666" }}>
                For the selected filters.
              </p>
            </div>

            {/* Real-time carbon intensity card */}
            <div
              style={{
                padding: "0.8rem",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "220px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1rem" }}>
                Live Grid Carbon Intensity
              </h3>
              {realtime ? (
                <>
                  <p style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                    {realtime.intensity ?? realtime.forecast} gCO₂/kWh
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#666" }}>
                    Index: <strong>{realtime.index || "n/a"}</strong>
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "#888" }}>
                    Source: UK National Grid Carbon Intensity API (Great
                    Britain, near real-time)
                  </p>
                </>
              ) : realtimeError ? (
                <p style={{ fontSize: "0.8rem", color: "red" }}>
                  {realtimeError}
                </p>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "#666" }}>Loading...</p>
              )}
            </div>
          </section>

          {/* Chart */}
          <section style={{ marginBottom: "1rem" }}>
            <h2>Emissions by Sector</h2>
            <SectorBarChart data={data} />
          </section>

          {/* Table */}
          <section>
            <h2>Detailed Data</h2>
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid #ddd",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Country</th>
                    <th style={thStyle}>Sector</th>
                    <th style={thStyle}>Year</th>
                    <th style={thStyle}>Emissions (MtCO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{row.country}</td>
                      <td style={tdStyle}>{row.sector}</td>
                      <td style={tdStyle}>{row.year}</td>
                      <td style={tdStyle}>{row.emissions}</td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td style={tdStyle} colSpan={4}>
                        No data for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Chat Panel */}
        <ChatPanel data={data} />
      </main>
    </div>
  );
}

const thStyle = {
  borderBottom: "1px solid #ccc",
  padding: "0.4rem",
  textAlign: "left",
  backgroundColor: "#f1f3f5",
};

const tdStyle = {
  borderBottom: "1px solid ",color:"#cfccccff",
  padding: "0.4rem"
};

export default App;