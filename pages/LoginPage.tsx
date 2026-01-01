import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";

export default function Login() {
  const { signIn, lang } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      navigate("/profile");
    } catch (e) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-black text-emerald-700 mb-6">
          {lang === "bn" ? "লগ ইন" : "Log In"}
        </h2>

        <input
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-6 p-3 border rounded-xl"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full p-4 rounded-xl bg-emerald-600 text-white font-black"
        >
          Log In
        </button>
      </div>
    </div>
  );
}