import { Geist, Geist_Mono } from "next/font/google";
import { provinces, provinceCodes } from "../constants/provinces";
import { useState } from "react";
import { useRouter } from "next/router";
// import handler from "./api/holidays";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
// export default function Home() {
  const [province, setProvince] = useState({ title: "", code: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [list, setList] = useState([{date: "", name: ""}]);

  const handleClick = () => {
    const elem = document.activeElement;
    if (elem) {
      (elem as HTMLElement)?.blur();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = `/api/holidays?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&prov=${encodeURIComponent(province.code)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: HTTP ${res.status}`);
      const json = await res.json();
      setList(json);
    } catch (error: any) {
      console.log("Error!");
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-base-100">
      <header className="sticky top-0 z-10 bg-base-100/90 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <h1 className="text-primary text-4xl font-bold">Find Public Holidays in Canada</h1>
          <form onSubmit={onSubmit} className="pb-5 pt-10">
            {/* Province dropdown */}
            <div className="dropdown mr-5">
              <div tabIndex={0} role="button" className="btn m-1 w-xs border-1 border-solid border-base-content">{province.title == "" ? "Choose Province" : province.title} ▼</div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                {provinces.map((province, index) => {
                  const title = province.substring(0, province.length - 3);
                  const code = province.substring(province.length - 2);
                  return (
                    <li key={province + index} onClick={() => { setProvince({ title: title, code: code }); handleClick(); }}><a>{title}</a></li>
                  )
                })}
              </ul>
            </div>
            {/* TODO: Date range selector here */}
            <input type="date" className="mr-2 px-2 py-1 border-1 border-solid rounded-lg cursor-pointer" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" className="ml-2 px-2 py-1 border-1 border-solid rounded-lg cursor-pointer" value={endDate} onChange={e => setEndDate(e.target.value)} />
            {/* TODO: Search button here */}
            <button className="btn ml-10 bg-accent text-info-content">
              Search
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 overflow-hidden px-4">
        {/* Display area here */}
        <div className="mx-auto max-w-xl py-6 space-y-4 h-[60vh]">
          <div className="card bg-base-200 p-4 text-center min-h-full h-full overflow-y-auto">
            {list ?
              (
                <ul>
                {list.map((item, index) => {
                  return (
                    <li key={item.name + index}>{item.date} {item.name}</li>
                  );
                })}
              </ul>
              )
            : <p>Nothing yet</p>}
          </div>
        </div>
      </main>
    </div>
  );
}