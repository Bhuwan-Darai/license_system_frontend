"use client"

import Image from "next/image";
import {useRouter} from "next/navigation";
import {Button} from "antd";

export default function Hero() {
    const router = useRouter();
    const handleChange = () => {
        router.push("/login");
    }
  return (
      <div className="mx-auto max-w-6xl px-6 md:px-8 mt-20 md:mt-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Text column */}
              <div>
                  <p className="font-serif text-[2.75rem] md:text-5xl leading-[1.1] text-[#131B2E] font-medium">
                      Your license, one clear trail from start to finish.
                  </p>

                  <p className="mt-6 text-[#5C6B7A] text-lg leading-relaxed max-w-md">
                      Likhit Yatra turns the licensing office's paperwork into a route you
                      can actually follow — register, practice the real written questions,
                      and walk into your exam knowing exactly what's next.
                  </p>

                  {/* Dotted route connecting the two lines of copy — literal nod to "yatra" */}
                  <div className="flex items-center gap-3 mt-6 mb-6 max-w-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8A6D3B] shrink-0" />
                      <span className="flex-1 border-t border-dotted border-[#8A6D3B]/50" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7A1F2B] shrink-0" />
                  </div>

                  <p className="font-devanagari text-lg text-[#131B2E]">
                      तपाईंको लाइसेन्स यात्रा सुरु हुन्छ यहाँबाट — दर्ताबाट लाइसेन्स प्राप्तिसम्म।
                  </p>

                  <button onClick={handleChange} className="mt-8 inline-flex items-center gap-2 bg-red-800 rounded-2xl text-[#FAF7F0] px-6 py-3 text-lg border-0">
                      Start Your Yatra
                  </button>
              </div>

              {/* Image column */}
              <div className="relative">
                  <Image
                      src="/license-card.png.jpg"
                      loading="eager"
                      width={520}
                      height={340}
                      alt="Sample Nepali driving license card"
                      className="w-full h-auto rounded-sm shadow-[0_20px_40px_-15px_rgba(19,27,46,0.35)]"
                  />
              </div>
          </div>
      </div>
  )
}