import { SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

function SerialLookup() {
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ NEW
  const navigate = useNavigate();

  const handleSearch = async () => {
    setError("");
    setResult(null);

    if (!serial) {
      setError("Please enter a serial number.");
      return;
    }

    setLoading(true); // ✅ START LOADER

    try {
      const res = await fetch(
        `https://yvpscmgrfnluvqwihjgw.supabase.co/functions/v1/get-serial-number?serial=${serial}`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else if (!json.data) {
        // ✅ No data returned
        setError("No details found for this serial number.");
      } else {
        setResult(json.data);
      }
    } catch (err) {
      setError("Error fetching data");
    }

    setLoading(false); // ✅ STOP LOADER
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      <h3
        style={{
          fontSize: 18,
          marginBottom: 15,
          fontWeight: 700,
          color: "#111827",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: 6,
        }}
      >
        Serial Number Lookup
      </h3>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="Enter serial number"
          style={{
            width: 250,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
          }}
        />

        <Button type="button" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"} {/* ✅ LOADER TEXT */}
        </Button>

        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Back to Login
        </Button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p style={{ color: "red", marginTop: 8, fontWeight: 500 }}>{error}</p>
      )}

      {/* NO RESULT? THEN STOP HERE */}
      {!loading && !result && !error ? null : null}

      {/* LOADER SPINNER PLACEHOLDER */}
      {loading && (
        <p style={{ marginTop: 20, fontSize: 16, fontWeight: 500 }}>
          Loading...
        </p>
      )}

      {/* RESULT TABLES */}
      {!loading && result && (
        <div
          style={{
            marginTop: 30,
            fontFamily: "Inter, sans-serif",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {/* ===== LEFT COLUMN : PRODUCT / WARRANTY ===== */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              padding: 15,
              border: "1px solid #d1d5db",
              borderRadius: 10,
              background: "#ffffff",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                marginBottom: 10,
                fontWeight: 700,
                color: "#111827",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: 6,
              }}
            >
              Product & Warranty Details
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <tbody>
                {[
                  "serial_number",
                  "status",
                  "registration_date",
                  "purchase_date",
                  "purchase_source",
                  "purchase_receipt_url",
                ].map((key, index) => {
                  const value = result[key];
                  const label = key.replace(/_/g, " ");

                  const isPDF =
                    typeof value === "string" &&
                    value.toLowerCase().endsWith(".pdf");

                  const isImage =
                    typeof value === "string" &&
                    (value.toLowerCase().endsWith(".jpg") ||
                      value.toLowerCase().endsWith(".jpeg") ||
                      value.toLowerCase().endsWith(".png") ||
                      value.toLowerCase().endsWith(".webp"));

                  return (
                    <tr
                      key={key}
                      style={{
                        background: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: 600,
                          color: "#1f2937",
                          width: "40%",
                          border: "1px solid #e5e7eb",
                          background: "#f3f4f6",
                          textTransform: "capitalize",
                        }}
                      >
                        {label}
                      </td>

                      <td
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                        }}
                      >
                        {key === "purchase_receipt_url" ? (
                          <div>
                            {isImage && (
                              <img
                                src={value}
                                alt="Receipt"
                                style={{
                                  width: 150,
                                  borderRadius: 6,
                                  border: "1px solid #ccc",
                                  marginBottom: 8,
                                }}
                              />
                            )}

                            {isPDF && (
                              <embed
                                src={value}
                                type="application/pdf"
                                width="180"
                                height="200"
                                style={{
                                  borderRadius: 6,
                                  border: "1px solid #ccc",
                                  marginBottom: 8,
                                }}
                              />
                            )}

                            {!isImage && !isPDF && <span>{String(value)}</span>}

                            <br />
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 13,
                                color: "#111827",
                                textDecoration: "underline",
                              }}
                            >
                              View file
                            </a>
                          </div>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===== RIGHT COLUMN : CUSTOMER DETAILS ===== */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              padding: 15,
              border: "1px solid #d1d5db",
              borderRadius: 10,
              background: "#ffffff",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                marginBottom: 10,
                fontWeight: 700,
                color: "#111827",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: 6,
              }}
            >
              Customer Details
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <tbody>
                {[
                  "customer_name",
                  "customer_email",
                  "customer_phone",
                  "created_at",
                  "updated_at",
                ].map((key, index) => (
                  <tr
                    key={key}
                    style={{
                      background: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#1f2937",
                        width: "40%",
                        border: "1px solid #e5e7eb",
                        background: "#f3f4f6",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/_/g, " ")}
                    </td>

                    <td
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #e5e7eb",
                        color: "#374151",
                      }}
                    >
                      {String(result[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SerialLookup;
