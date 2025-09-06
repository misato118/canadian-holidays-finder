import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div>
      <h1>Find Public Holidays in Canada</h1>
      {/* TODO: Province dropdown here */}
      
      {/* TODO: Date range selector here */}
      {/* TODO: Search button here */}
      {/* TODO: Display area here */}
    </div>
  );
}
