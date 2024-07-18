import Navbar from "@/components/Navbar"
import { getStats, getUser } from "@/libs/action"
import { cookies } from "next/headers";
import Image from "next/image"



const page = async () => {

    const stats = await getStats()!;
    // const cookie: any = await cookies().get("chat") || 5195131141;
    // const user = await getUser(cookie?.value);

    // Calculate total tokens mined
    const totalTokensMined = stats?.reduce((total, user) => total + user.tokens, 0);
    // Calculate total shares of bot via total refers array length
    const totalSharesOfBot = stats?.reduce((accumulator, user) => accumulator + user.totalRefers.length, 0);

    // Find the length of users where autoTap is true
    // const usersWithAutoTap = userArray.filter(user => user.autoTap === true);
    // const lengthOfUsersWithAutoTap = usersWithAutoTap.length;

    return (
        <div className="w-full relative min-h-screen  flex overflow-hidden">
            <Image src="/bg.png" alt="jpg image" width={1000} height={1000} className="h-[100vh] object-cover " />

            <div className=" absolute top-[20px] left-0 w-full flex flex-col items-center justify-center z-[4] ">
                <Image src="/logo.png" alt="shisha" width={400} height={400} className="w-[120px] " />
                <h1 className="text-white text-5xl font-bold">STATS</h1>

                <h3 className="mt-[30px] text-4xl text-white font-extrabold">Total Tokens Raised</h3>
                <p className="text-yellow-400 text-3xl font-bold mt-1">
                    {totalTokensMined.toLocaleString()}
                </p>

                {/* <h3 className="mt-[20px] text-4xl text-white font-extrabold">BonkBoost Bot Subscribers</h3>
                <p className="text-yellow-400 text-3xl font-bold mt-1">
                    {stats?.find(e => e.autoTap === true).length}
                </p> */}

                {/* <p className="text-gray-300 mt-1 font-semibold text-sm">Your Share : <span className="text-green-500">{Number((user?.tokens / totalTokensMined) * 100).toFixed(3)}% </span></p> */}
                <h3 className="mt-[20px] text-4xl text-white font-extrabold">Total Users</h3>
                <p className="text-yellow-400 text-3xl font-bold mt-1">
                    {stats?.length}
                </p>
                <h3 className="mt-[20px] text-4xl text-white font-extrabold">Total Shares</h3>
                <p className="text-yellow-400 text-3xl font-bold mt-1">
                    {totalSharesOfBot}
                </p>
            </div>
            <Navbar />
        </div>
    )
}

export default page