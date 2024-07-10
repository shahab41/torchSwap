import Navbar from "@/components/Navbar";
import AutoTapClaimModal from "@/components/utils/AutoTapClaimModal";
import ClickComponent from "@/components/utils/ClickComponent";
import { getUser } from "@/libs/action";
import { cookies } from "next/headers";
import Image from "next/image";
import { Suspense } from "react";

export default async function Home() {

  const cookie: any = await cookies().get("chat");
  const taps: any = await cookies().get('taps')?.value || "false"


  const user = await getUser(cookie?.value);

  const name = user?.name?.trim().split(' ');
  const lastName = name?.length > 1 ? name.pop() : null;
  const firstName = name?.join(' ');

  return (
    <div className='relative w-full min-h-screen '>
      <Image src={'/bg.png'} alt='bg-image' width={1000} height={1000} className='w-full min-h-screen object-cover z-[1]' />
      <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden  max-w-[500px] mx-auto w-full absolute top-[10px] left-0 ">

        <div className="w-full min-h-[100vh] flex flex-col items-center relative pt-[20px]">
          <div className='w-[100px] h-[100px] rounded-full bg-yellow-500 flex items-center justify-center mb-[10px] '>
            {/* <Image src={'/token.png'} alt="token" width={200} height={200} className="w-full object-cover" /> */}
            <h1 className="text-white text-5xl font-extrabold">
              {firstName?.slice(0, 1)}
            </h1>
          </div>
          <h6 className="mix-head my-1">
            {firstName}
            {lastName && <span> {lastName}</span>}
          </h6>
          <Suspense>
            <ClickComponent user={JSON.stringify(user)} taps={taps} />
            {user?.autoTap && <AutoTapClaimModal />}
          </Suspense>
          <Navbar />
        </div>
      </main>
    </div>
  );
}
