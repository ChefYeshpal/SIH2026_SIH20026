import { useState } from "react";
import InputPage from "./InputPage";
import Shappage from "./ShapPage"

// using super basic tab switcher instead of real router rn
// swap for reach router layer once pages are stable

export default function App() {
    const [page, setPage] = useState("input");

    return (
        <div style={{ fontFamily: "sans-serif", padding: "20px", maxWidt: "900px", margin: "0 auto" }}>
            <h1>Freight Forecast Frontend (Work in Progress)</h1>

            <nav style={{ marginBottom: "20px" }}>
                <button onClick={() => setPage("input")}>Forecast Input</button>{" "}
                <button onClick={() => setPage("shap")}>Model Explainability</button>
            </nav>

            {page === "input" && <InputPage />}
            {page === "shap" && <Shappage />}
        </div>
    );
}