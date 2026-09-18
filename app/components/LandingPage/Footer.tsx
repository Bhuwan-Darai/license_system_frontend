"use client"
import React from "react";

const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const ProductHuntIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.604 8.4h-3.405V12h3.405a1.8 1.8 0 000-3.6zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.604 13.8h-1.805V15.6h-1.8V4.8h3.605a3.6 3.6 0 010 7.2z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const CoframeLogo = () => (
    <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
        <path d="M4 8L10 2L16 8L10 14L4 8Z" fill="#6B7280" />
        <path d="M10 14L16 8L22 14L16 20L10 14Z" fill="white" />
    </svg>
);

export default function Footer() {
    return (
        <footer className="bg-[#0a0e1a] text-white min-h-screen flex flex-col">
            {/* Main Content */}
            <div className="flex-1 px-8 md:px-16 lg:px-24 pt-16 pb-12">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                    {/* Left Column - Brand */}
                    <div className="lg:w-1/3 max-w-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-red-800 rounded-2xl w-14 h-14 flex items-center justify-center text-white">
                                <span className="text-lg font-semibold">LY</span>
                            </div>

                            <p className="text-2xl font-bold tracking-tight">
                                Likhit Yatra
                            </p>
                        </div>
                        <p className="text-gray-400 text-base leading-relaxed mb-8">
                            Optimize and personalize your digital experiences, at scale.
                        </p>
                        <div className="flex items-center gap-5">
                            <a href="#" className="text-white hover:text-gray-300 transition-colors">
                                <LinkedInIcon />
                            </a>
                            <a href="#" className="text-white hover:text-gray-300 transition-colors">
                                <XIcon />
                            </a>
                            <a href="#" className="text-white hover:text-gray-300 transition-colors">
                                <GitHubIcon />
                            </a>
                            <a href="#" className="text-white hover:text-gray-300 transition-colors">
                                <ProductHuntIcon />
                            </a>
                        </div>
                    </div>

                    {/* Right Columns - Links */}
                    <div className="flex flex-col sm:flex-row gap-16 lg:gap-20">
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-5">Product</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Case Studies
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        AI Research
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-5">Company</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Terms of Use
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-5">Resources</h4>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Docs
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Trust Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                        Get Started
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Subscribe Section */}
                <div className="mt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <h3 className="text-white text-lg font-semibold leading-snug max-w-xs">
                        Subscribe for personalized insights and news
                    </h3>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="bg-transparent border border-gray-600 rounded-lg px-5 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors w-full md:w-72"
                        />
                        <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 transition-colors flex-shrink-0">
                            <ArrowRightIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-8 md:px-16 lg:px-24 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-800/50">
                <p className="text-gray-500 text-sm">© 2026 License Yatra.</p>
                <p className="text-gray-500 text-sm">
                    Made with <span className="text-red-500">❤</span> in Nepal.
                </p>
            </div>
        </footer>
    );
}