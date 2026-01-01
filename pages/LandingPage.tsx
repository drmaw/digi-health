import { Link } from "react-router-dom";
import { useApp } from "../AppContext";

export default function Landing() {
  const { lang, setLang } = useApp();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 flex bg-slate-100 rounded-lg p-1 border">
        <button
          onClick={() => setLang("bn")}
          className={`px-3 py-1 text-[10px] font-black rounded ${
            lang === "bn" ? "bg-white shadow text-emerald-700" : "text-slate-400"
          }`}
        >
          বাংলা
        </button>
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1 text-[10px] font-black rounded ${
            lang === "en" ? "bg-white shadow text-emerald-700" : "text-slate-400"
          }`}
        >
          EN
        </button>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-black text-emerald-700 mb-6">
          DiGi Health
        </h1>

        <Link
          to="/signup"
          className="block w-full mb-4 p-4 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700"
        >
          {lang === "bn" ? "নিবন্ধন করুন" : "Sign Up"}
        </Link>

        <Link
          to="/login"
          className="block w-full p-4 rounded-xl border font-black text-emerald-700 hover:bg-emerald-50"
        >
          {lang === "bn" ? "লগ ইন" : "Log In"}
        </Link>
      </div>
    </div>
  );
}