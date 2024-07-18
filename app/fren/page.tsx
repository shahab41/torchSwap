"use server";

import Navbar from "@/components/Navbar";
import ShareButton from "@/components/utils/ShareButton";
import { getUser } from "@/libs/action";
import { cookies } from "next/headers";
import Image from "next/image";
import React, { Suspense } from "react";
import Loading from "../loading";

const page = async () => {
  const cookie: any = await cookies().get("chat")!;
  const user = await getUser(cookie?.value);

  return (
    <div className="relative w-full min-h-screen ">
      <Image
        src={"/bg.png"}
        alt="bg-image"
        width={1000}
        height={1000}
        className="w-full min-h-screen object-cover z-[1]"
      />
      <div className="w-full min-h-[100vh] flex flex-col max-w-[500px] mx-auto pb-[85px] z-[2] top-[10px] left-0 absolute">
        {/* <Stars /> */}
        <div className="w-full flex flex-col items-center justify-center mt-[10px]">
          <Image src="/logo.png" alt="fren" width={80} height={80} />
          <h1 className="mix-head mt-5 ">
            Invite<span> Frens </span>
          </h1>

          <div className="blurry px-5 py-6 rounded-xl w-[90%] mx-auto mt-[15px] flex items-center justify-center ">
            <Image src="/token.png" alt="emore" width={30} height={30} />
            <h3 className="text-white font-extrabold text-lg ml-3">
              {user?.tokens?.toLocaleString()}
              <span className="ml-1">Tourch Swap</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-200 w-[90%] mx-auto my-3">
            Refer Your Freinds and earn Flat 5000 Tokens, when your freind join
            us with your link.
          </p>
          <h6 className="w-[90%] mx-auto text-white font-bold mt-1 text-xl flex items-center justify-between">
            {user.totalRefers.length} Fren{" "}
            <span className="text-green-500 text-lg">
              + {user?.commissionEarned} Tourch Swap
            </span>
          </h6>
          <Suspense fallback={<Loading />}>
            <div className="flex flex-col  mt-2 w-[98%] rounded-3xl blurry px-4 py-6 h-[220px] mb-[10px] gap-[14px]">
              {/* Cards */}
              {user?.totalRefers?.map((e: any) => (
                <div
                  key={e._id}
                  className="w-full flex items-center justify-between "
                >
                  <div className="flex items-center ">
                    <div className="w-[40px] h-[40px] rounded-full bg-gray-500 flex items-center justify-center">
                      <h6 className="font-semibold text-white text-sm">
                        {e.name.slice(0, 1)}
                      </h6>
                    </div>

                    <div className=" flex flex-col ml-3 ">
                      <h5 className="text-white font-semibold text-sm">
                        {e.name}
                      </h5>
                      <p className="text-light text-gray-300 text-xs mt-[2px]">
                        {e?.totalRefers?.length}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm">
                      {e?.tokens} Tourch Swap
                    </h5>
                  </div>
                </div>
              ))}
            </div>
          </Suspense>

          <ShareButton code={user?.inviteCode} />
        </div>

        <Navbar />
      </div>
    </div>
  );
};

export default page;
