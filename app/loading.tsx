import Image from 'next/image';
import React from 'react';

export default function Loading() {
    return (
        <div className='relative w-full min-h-screen '>
            <Image src={'/bg.png'} alt='bg-image' width={1000} height={1000} className='w-full min-h-screen object-cover z-[1]' />
            <main className="flex min-h-screen flex-col items-center justify-center  max-w-[500px] mx-auto w-full z-[2] top-[10px] left-0 absolute  ">

                <div className="pyramid-loader">
                    <div className="wrapper">
                        <span className="side side1"></span>
                        <span className="side side2"></span>
                        <span className="side side3"></span>
                        <span className="side side4"></span>
                        <span className="shadow"></span>
                    </div>
                </div>
            </main>
        </div>
    )
}
