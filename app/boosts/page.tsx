import Navbar from '@/components/Navbar';
import EnergyFullBooster from '@/components/utils/EnergyFullBooster';
import EnergyLimitBoosts from '@/components/utils/EnergyLimitBoosts';
import MultipleBooster from '@/components/utils/MultipleBooster';
import PerClickBoosts from '@/components/utils/PerClickBoosts';
import RechargingBooster from '@/components/utils/RechargingBooster';
import { getUser } from '@/libs/action';
import { cookies } from 'next/headers';
import Image from 'next/image';
import React, { Suspense } from 'react'
import Loading from '../loading';
import AutoTapBoost from '@/components/utils/AutoTapBoost';

const page = async () => {


    const cookie: any = await cookies().get("chat")!;
    const user = await getUser(cookie?.value);

    return (
        <div className='relative w-full min-h-screen '>
            <Image src={'/bg.png'} alt='bg-image' width={1000} height={1000} className='w-full min-h-screen object-cover z-[1]' />
            <div className="w-full min-h-[100vh] flex flex-col   max-w-[500px] mx-auto pb-[85px] absolute z-[2] top-[10px]  left-0">
                {/* <Stars /> */}
                <div className='w-full flex flex-col items-center justify-center mt-[10px]'>
                    <Image src="/logo.png" alt='fren' width={80} height={80} />
                    <h1 className="mix-head mt-5 " >
                        BONK<span> BOOSTS </span>
                    </h1>

                    <div className=' py-3 rounded-xl w-[90%] mx-auto mt-[15px] flex items-center justify-center '>
                        <Image src="/token.png" alt='emore' width={30} height={30} />
                        <h3 className='text-white font-extrabold text-2xl ml-3 mb-4'>{user?.tokens?.toLocaleString()}<span className='ml-1'>BONK BOOST</span></h3>
                    </div>

                    <Suspense fallback={<Loading />}>

                        <div className="flex w-[95%] mx-auto gap-[10px] items-center justify-between mt-[6] mb-[2]">
                            <MultipleBooster user={JSON.stringify(user)} />
                            <EnergyFullBooster user={JSON.stringify(user)} />
                        </div>

                        <div className="flex flex-col items-center justify-center w-full">
                            <PerClickBoosts user={JSON.stringify(user)} />
                            <EnergyLimitBoosts user={JSON.stringify(user)} />
                            <RechargingBooster user={JSON.stringify(user)} />
                            <AutoTapBoost user={JSON.stringify(user)} />
                        </div>
                    </Suspense>
                </div>

                <Navbar />

            </div>
        </div>
    )
}

export default page