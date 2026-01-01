import { useState } from "react";
import { useApp } from "../AppContext";

export default function AuthPage() {
  const { signIn, signUp } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setError("");
    setLoading(true);

    try {
      // Try login first
      await signIn(email, password);
    } catch {
      try {
        // If login fails, create account
        await signUp(email, password, name || "New User", phone || "N/A");
      } catch (e: any) {
        setError(e.message);
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "100px auto", textAlign: "center" }}>
      <h2>Login / Signup</h2>

      <input
        placeholder="Name (for signup)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }}
      />

      <input
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 8 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 12, padding: 8 }}
      />

      <button onClick={handleContinue} disabled={loading} style={{ padding: 10, width: "100%" }}>
        {loading ? "Please wait..." : "Continue"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}