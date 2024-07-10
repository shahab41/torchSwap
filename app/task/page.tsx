import Navbar from '@/components/Navbar'
import Tasks from '@/components/utils/Tasks';
import { getTasks, getUser } from '@/libs/action';
import { cookies } from 'next/headers';
import Image from 'next/image'
import React, { Suspense } from 'react'
import Loading from '../loading';

const page = async () => {

    const cookie: any = await cookies().get("chat") || 5195131141;

    const user = await getUser(cookie?.value);
    const task = await getTasks();

    return (
        <div className='relative w-full min-h-screen '>
            <Image src={'/bg.png'} alt='bg-image' width={1000} height={1000} className='w-full min-h-screen object-cover z-[1]' />
            <div className="w-full min-h-[100vh] flex flex-col  absolute max-w-[500px] mx-auto pb-[85px] z-[2] top-[10px]  left-0">
                {/* <Stars /> */}
                <div className='w-full flex flex-col items-center justify-center   '>
                    <Image src="/logo.png" alt='fren' width={80} height={80} />
                    <h1 className="mix-head mt-3 " >
                        BONK BOOST<span> TASKS </span>
                    </h1>
                </div>

                <div className=' py-3 rounded-xl w-[90%] mx-auto mt-[7px] flex items-center justify-center '>
                    <Image src="/token.png" alt='emore' width={30} height={30} />
                    <h3 className='text-white font-extrabold text-2xl ml-3'>{user?.tokens?.toLocaleString()}<span className='ml-1'>BONK BOOST</span></h3>
                </div>

                <Suspense fallback={<Loading />}>
                    <Tasks user={JSON.stringify(user)} tasks={JSON.stringify(task)} />
                </Suspense>
                <Navbar />
            </div>
        </div>
    )
}

export default page