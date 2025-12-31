import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../AppContext";

export default function SignUp() {
  const { signUp, lang } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      await signUp(email, password, name, phone);
      navigate("/profile");
    } catch (e) {
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-black text-emerald-700 mb-6">
          {lang === "bn" ? "নিবন্ধন" : "Sign Up"}
        </h2>

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="Mobile"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-xl"
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
          onClick={handleSignUp}
          className="w-full p-4 rounded-xl bg-emerald-600 text-white font-black"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}