"use client";

import Link from "next/link";
import {Button} from "antd";

export default function Header() {
    return (
        <div>
            <header className="bg-red-800 w-full px-12 py-3 grid grid-cols-3 items-center">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="bg-[#EEE8DD] rounded-2xl w-14 h-14 flex items-center justify-center text-red-800">
                        <span className="text-2xl font-bold">LY</span>
                    </div>

                    <p className="text-[#EEE8DD] ml-3 font-semibold text-xl">
                        Likhit Yatra
                    </p>
                </div>

                {/* Center Menu */}
                <nav className=" text-[#EEE8DD] flex justify-center items-center gap-8">
                    <Link href="/home" className=" hover:text-red-800">
                        Home
                    </Link>

                    <Link href="/about" className=" hover:text-red-800">
                        About
                    </Link>

                    <Link href="/contact" className="hover:decoration-[#EEE8DD]">
                        Contact
                    </Link>
                </nav>

                <div className="pr-[100px] flex justify-end items-center hover:appearance-none">
                    <Button style={{width:'100px', borderRadius:'12px', padding:'20px', color:'#991B1B', fontWeight:'bold', fontSize:'1.05rem', display:'flex', justifyItems:'end'}} onClick={()=>{}}>
                        Login
                    </Button>
                </div>

                <div />
            </header>
        </div>

    );
}