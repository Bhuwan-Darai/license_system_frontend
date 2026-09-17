"use client";

import Link from "next/link";
import Image from 'next/image'

export default function Header() {
    return (
        <div>
            <header className="w-full px-6 py-3 grid grid-cols-3 items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="bg-red-800 rounded-2xl w-14 h-14 flex items-center justify-center text-white">
                        <span className="text-lg font-semibold">LY</span>
                    </div>

                    <p className="text-black ml-3 font-semibold text-xl">
                        Likhit Yatra
                    </p>
                </div>

                {/* Center Menu */}
                <nav className="flex justify-center items-center gap-8">
                    <Link href="/home" className="text-black hover:text-red-800">
                        Home
                    </Link>

                    <Link href="/about" className="text-black hover:text-red-800">
                        About
                    </Link>

                    <Link href="/courses" className="text-black hover:text-red-800">
                        Courses
                    </Link>

                    <Link href="/contact" className="text-black hover:text-red-800">
                        Contact
                    </Link>
                </nav>

                {/* Empty right column */}
                <div />
            </header>
            <div className="flex items-center justify-between">
                <div className="text-black">
                    <p className="text-4xl w-1/2">Your license, one clear trail from start to finish.</p>
                    <p className="w-1/2">Likhit Yatra turns the licensing office&lsquo;s paperwork into a route you can actually follow — register, practice the real written questions, and walk into your exam knowing exactly what's next.</p>
                    <p>तपाईंको लाइसेन्स यात्रा सुरु हुन्छ यहाँबाट — दर्ताबाट लाइसेन्स प्राप्तिसम्म।</p>
                </div>
                <div>
                    <Image src="/license-card.png.jpg"  width={500}
                           height={500}
                           alt="Picture of the author"/>
                </div>

            </div>
        </div>

    );
}