import { SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

function SerialLookup() {
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    setError("");
    setResult(null);

    if (!serial) {
      setError("Please enter a serial number.");
      return;
    }

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
      } else {
        setResult(json.data);
      }
    } catch (err) {
      setError("Error fetching data");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto" }}>
      <h3>Serial Number Lookup</h3>

      <input
        type="text"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        placeholder="Enter serial number"
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <Button type="button" className="w-full" onClick={handleSearch}>
        Search
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full mt-2"
        onClick={() => {
          navigate(-1);
        }}
      >
        Back to Login
      </Button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SerialLookup;
