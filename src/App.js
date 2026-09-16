import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState(null);

  const pdfRef = useRef();

  // Visitor Counter
  useEffect(() => {
    axios.get(`${API_BASE}/visit`)
      .then(res => setVisitors(res.data.visitors))
      .catch(() => {});
  }, []);

  // Search
  const search = async () => {
    if (!query.trim()) return;
    setSelected(null);
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/search?query=${query}`);
      setResults(res.data.results || []);
    } catch {
      alert("Search failed");
    }

    setLoading(false);
  };

  // Load Receipt
  const loadReceipt = async (admNo) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/receipt/adm/${admNo}`);
      setSelected(res.data);
    } catch {
      alert("Receipt not found");
    }
    setLoading(false);
  };

  // Download PDF
  const downloadPDF = () => {
    html2pdf()
      .set({
        margin: 0.5,
        filename: `${selected.admission_no}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { format: "a4" },
      })
      .from(pdfRef.current)
      .save();
  };

  return (
    <div className="page">

      {/* VISITOR BADGE (TOP RIGHT) */}
      <div className="visitor-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="eye-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>

        <span id="visitorCount">
          {visitors !== null ? visitors : "..."}
        </span>
      </div>

      {/* HEADER & SEARCH BAR (Only shown when no receipt is selected) */}
      {!selected && (
        <>
          <header className="header">
            <img src="/logo.svg" alt="OkieDokie Logo" className="portal-logo" />
            <h1>OkieDokie Fee Receipt Portal</h1>
            <p className="subtitle">Professional • Fast • Accurate</p>
          </header>

          <div className="search-box glass">
            <input
              type="text"
              placeholder="Search by Name / Admission Number / Phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button onClick={search}>Search</button>
          </div>
        </>
      )}

      {loading && <p className="loading">Loading…</p>}

      {/* RESULTS TABLE */}
      {results.length > 0 && !selected && (
        <div className="glass card table-card">
          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Name</th>
                <th>Adm No</th>
                <th>Mobile</th>
                <th>Session</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.Receipt}</td>
                  <td>{r["Student's Name"]}</td>
                  <td>{r["Adm No"]}</td>
                  <td>{r["Mobile No"]}</td>
                  <td>{r.session}</td>
                  <td>
                    <button className="open-btn"
                      onClick={() => loadReceipt(r["Adm No"])}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECEIPT VIEW */}
      {selected && (
        <>
          <div className="receipt-actions-top">
            <button className="back-btn" onClick={() => setSelected(null)}>
              ← Back
            </button>
          </div>

          <div className="glass receipt card" ref={pdfRef}>
            <div className="receipt-header-flex">
              <img
                src="/images-removebg-preview (1).png"
                alt="College Logo"
                className="receipt-logo-left"
              />
              <div className="receipt-header-text">
                <h2 className="receipt-title">Shah Satnam Ji Girls College</h2>
                <p className="small-sub">
                  Shah Satnam Ji Dham Nejia Khera<br />
                  Near Shah Satnam Ji Pura, Sirsa, Haryana - 125055<br />
                  Ph: 01666238602 | Email: ssgians1@gmail.com<br />
                  shahsatnamjigirlscollege.com
                </p>
              </div>
            </div>

            <h3 className="section-title">Fee Receipt</h3>

            <div className="details-grid">
              <span>Receipt No</span><b>{selected.receipt_no}</b>
              <span>Date</span><b>{selected.date}</b>

              <span>Admission No</span><b>{selected.admission_no}</b>
              <span>Session</span><b>{selected.session}</b>

              <span>Student Name</span><b>{selected.student_name}</b>
              <span>Course</span><b>{selected.course}</b>

              <span>Father's Name</span><b>{selected.father_name}</b>
              <span>Mobile</span><b>{selected.mobile}</b>

              <span>Aadhar No</span><b>{selected.aadhar}</b>
              <span>Status</span><b>{selected.status}</b>

              {selected.caste && <><span>Caste</span><b>{selected.caste}</b></>}

              <span>Address</span>
              <b className="full">{selected.address}</b>
            </div>

            <table className="fee-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Fee Head</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {selected.fee_items.map((f, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{f.fee_head}</td>
                    <td>₹{f.amount}</td>
                  </tr>
                ))}

                <tr className="total-row">
                  <td></td>
                  <td><b>Total</b></td>
                  <td><b>₹{selected.fee_total}</b></td>
                </tr>
              </tbody>
            </table>

            <div className="payment-info">
              <p><b>Payment Mode:</b> {selected.method}</p>
              <p><b>Ref No:</b> {selected.payment_details}</p>
              <p><b>Paid Amount:</b> ₹{selected.paid_amount}</p>
              <p><b>In Words:</b> {selected.fee_total_words}</p>
              <p><b>Remarks:</b> {selected.remarks}</p>
            </div>

            <div className="clerk">
              <b>{selected.user}</b>
              <p>Fees Clerk</p>
            </div>
          </div>

          <div className="button-group">
            <button className="back-btn" onClick={() => setSelected(null)}>
              ← Back
            </button>
            <button className="download-btn" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
