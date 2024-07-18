"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClose } from "@fortawesome/free-solid-svg-icons";
import { upgradeEnergyLimit, upgradePerClickLevel } from "@/libs/action";
import toast from "react-hot-toast";
// import CloseIcon from "@mui/icons-material/Close";

interface ClickBooster {
    user: string; // User prop as string
}

const EnergyLimitBoosts: React.FC<ClickBooster> = ({ user }) => {
    const userData = JSON.parse(user);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(!open);

    const calculatePrice = (level: number) => {
        switch (level) {
            case 1:
                return 0; // Level 1 is free
            case 2:
                return 10000; // Level 2 price
            case 3:
                return 20000; // Level 3 price
            case 4:
                return 40000; // Level 4 price
            case 5:
                return 60000; // Level 5 price
            case 6:
                return 80000; // Level 5 price
            case 7:
                return 100000; // Level 5 price
            case 8:
                return 130000; // Level 5 price
            case 9:
                return 180000; // Level 5 price
            case 10:
                return 200000; // Level 5 price
            case 11:
                return 250000; // Level 5 price
            case 12:
                return 300000; // Level 5 price
            case 13:
                return 320000; // Level 5 price
            case 14:
                return 400000; // Level 5 price
            case 15:
                return 450000; // Level 5 price
            case 16:
                return 550000; // Level 5 price
            case 17:
                return 600000; // Level 5 price
            default:
                return 0;
        }
    };

    const getPrice = (level: number) => {
        if (level === 1) {
            return "Free"; // Level 1 is free
        } else {
            const price = calculatePrice(level);
            return `${price.toLocaleString("US")}`;
        }
    };
    const handleConfirm = async () => {
        try {
            setLoading(true);
            let nextLevel = userData?.maxEnergyLimit / 500 + 1; // Calculate next level based on maxEnergyLimit
            let payAmt = calculatePrice(nextLevel) as number;

            // Make the API call to upgrade perClick level
            await upgradeEnergyLimit(nextLevel, payAmt);

            // If successful, show success message
            toast.success(`🚀 Energy Limit Upgraded to ${nextLevel * 500}.`);


            // Close the modal and reset loading state
            handleClose();
        } catch (error) {
            console.error('Error upgrading perClick level:', error);
            // Handle errors if necessary
        } finally {
            setLoading(false); // Ensure loading state is always reset
        }
    };

    return (
        <>
            <div onClick={userData.maxEnergyLimit < 8500 ? handleOpen : undefined} className="w-[90%] mx-auto flex items-center justify-between  rounded-2xl mt-4 border-b blurry px-2 py-4">
                <div className="flex items-center h-full">
                    <Image src={'/icon/limit.png'} width={40} height={40} alt="ppx" />
                    <div className="ml-3 flex flex-col">
                        <h1 className="text-sm font-bold text-white">Energy Limit</h1>
                        <p className="text-gray-300 font-light text-xs mt-1 flex "><Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1" /> <span className="mr-2">  {userData.maxEnergyLimit === 8500 ? "Max." : getPrice(userData.maxEnergyLimit / 500 + 1)} </span> | Level : <span>{userData.maxEnergyLimit / 500}</span></p>
                    </div>
                </div>

                <button className="text-gray-400 text-xs pr-3 ">
                    <FontAwesomeIcon icon={faChevronRight} className="max-w-[20px] bg-gray-900" />
                </button>
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
                        // Add your additional classes or styles here
                        borderStartStartRadius: 40,
                        zIndex: 999, // Example of additional styles
                    }}
                >

                    {/* Close icon */}
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

                    {/* Image of multitap */}
                    <div className="flex justify-center items-center mt-4">
                        <Image src="/icon/limit.png" width={80} height={80} alt="Energy Image" />
                    </div>

                    {/* Title and details */}
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                        <h1 className="text-white text-2xl font-bold my-2">
                            Energy Limit
                        </h1>
                        <p className="text-sm text-gray-300 text-center">
                            Are you sure you want to increase your energy limit to {userData.maxEnergyLimit + 500}?
                        </p>
                        <div className="flex my-2 w-full items-center justify-center gap-[30px] mt-4">
                            <p className="flex text-white text-sm items-center font-semibold"> <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1 w-[20px]" />  {getPrice(userData.maxEnergyLimit / 500 + 1)}</p>
                            <p className="flex text-white text-sm items-center font-semibold"> Level: {userData.maxEnergyLimit / 500 + 1}</p>
                        </div>
                    </Box>


                    <button onClick={handleConfirm} disabled={userData.tokens < calculatePrice(userData.maxEnergyLimit / 500 + 1) || userData.maxEnergyLimit >= 7500 || loading} className="text-white text-md w-full text-center py-3 my-2 rounded-md bg-yellow-500 font-semibold disabled:bg-gray-400 disabled:text-white">
                        {
                            loading ? "Getting Over It..." : "Get It"
                        }
                    </button>
                </Box>
            </Modal></>
    );
};

export default EnergyLimitBoosts;
