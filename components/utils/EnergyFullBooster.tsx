"use client"

import React, { useEffect, useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getUserBoosters, useBooster } from '@/libs/action';
import { useRouter } from 'next/navigation';

interface ClickBooster {
    user: string; // User prop as string
}

const EnergyFullBooster: React.FC<ClickBooster> = ({ user }) => {
    const userData = JSON.parse(user);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dailyBoosters, setDailyBoosters] = useState<number>(0);
    const [nextReset, setNextReset] = useState<Date | null>(null);


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const router = useRouter();

    useEffect(() => {
        const fetchBoosterData = async () => {
            try {
                const result = await getUserBoosters();
                if (result) {
                    setDailyBoosters(result.dailyBoosters);
                    setNextReset(new Date(result.nextReset));
                }
            } catch (error) {
                console.error("Error fetching booster data:", error);
            }
        };

        fetchBoosterData();

        const interval = setInterval(fetchBoosterData, 60000); // Refresh booster data every minute

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, []);


    const handleUseBooster = async () => {
        setLoading(true);
        try {
            const result = await useBooster();
            if (result?.success) {
                toast.success("Hurray!! You Claimed Free Booster for max energy limit!");
                setDailyBoosters(result.dailyBoosters);
                setOpen(!open);
                router.push('/')
            } else {
                toast.error(result?.message || "Error using booster");
            }
        } catch (error) {
            console.error("Error using booster:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div onClick={handleOpen} className='w-[50%] rounded-xl blurry py-4 px-2 flex items-center justify-between border-b flex-col cursor-pointer' >
                <div className="flex items-center h-full">
                    <Image src={'/icon/energy.png'} width={30} height={30} alt="ppx" />
                    <div className="ml-3 flex flex-col">
                        <h1 className="text-sm font-bold text-white">Daily Energy</h1>
                        <p className="text-gray-300 font-light text-xs mt-1 flex">
                            <span>
                                {dailyBoosters > 0 ? `${dailyBoosters}/3 | FREE` : `${dailyBoosters}/3 | USED`}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#111827',
                        padding: 4,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        boxShadow: 24,
                        borderStartStartRadius: 40,
                        zIndex: 999,
                    }}
                >


                    <IconButton
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'white',
                        }}
                        onClick={handleClose}
                    >
                        <FontAwesomeIcon icon={faClose} className="max-w-[30px]" />
                    </IconButton>

                    <div className="flex justify-center items-center mt-4">
                        <Image src="/icon/energy.png" width={80} height={80} alt="Multitap Image" />
                    </div>

                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                        <h1 className="text-white text-2xl font-bold my-2">Daily Energy</h1>
                        <p className="text-sm text-gray-300 text-center">
                            Get it for making your energy full, so you can tap and earn tokens!
                        </p>
                        <div className="flex my-2 w-full items-center justify-center gap-[30px]">
                            <p className="flex text-white text-sm items-center font-semibold">
                                <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1 w-[20px]" /> {userData?.maxEnergyLimit}
                            </p>
                            <p className="flex text-white text-sm items-center font-semibold">{dailyBoosters}/3</p>
                        </div>
                    </Box>

                    <button
                        className="text-white text-md w-full text-center py-3 my-2 rounded-md bg-yellow-500 font-semibold disabled:bg-gray-400 disabled:text-white"
                        onClick={handleUseBooster}
                        disabled={loading || dailyBoosters <= 0}
                    >
                        {loading ? "Getting Over It..." : "Get It"}
                    </button>
                </Box>
            </Modal>
        </>
    );
};


export default EnergyFullBooster;
