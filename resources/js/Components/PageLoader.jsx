import React from 'react';

const PageLoader = ({ visible }) => {
    return (
        <div 
            className={`fixed inset-0 z-[200] flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div className="flex flex-col items-center justify-center space-y-5">
                {/* Premium Double Ring Spinner */}
                <div className="relative flex items-center justify-center h-16 w-16">
                    <div className="absolute h-full w-full rounded-full border-4 border-teal-100 dark:border-teal-900/30"></div>
                    <div className="absolute h-full w-full rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                    
                    <div className="absolute h-10 w-10 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
                    <div className="absolute h-10 w-10 rounded-full border-4 border-indigo-500 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
                </div>
                
                <div className="text-teal-800 dark:text-teal-300 font-bold text-sm tracking-[0.2em] animate-pulse">
                    MEMUAT...
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
