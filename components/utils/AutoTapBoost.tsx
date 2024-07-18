"use client";

import React, { useState } from "react";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClose } from "@fortawesome/free-solid-svg-icons";
import { startAutoBot, upgradeRechargingSpeed } from "@/libs/action";
import toast from "react-hot-toast";
// import CloseIcon from "@mui/icons-material/Close";

interface ClickBooster {
    user: string; // User prop as string
}

const AutoTapBoost: React.FC<ClickBooster> = ({ user }) => {
    const userData = JSON.parse(user);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(!open);


    const handleConfirm = async () => {
        try {
            setLoading(true);

            // Make the API call to upgrade perClick level
            await startAutoBot();

            // If successful, show success message
            toast.success(`🚀Bont bot started successfully!`);

            // Close the modal and reset loading state
            handleClose();
        } catch (error) {
            console.error('Error upgrading auto tap bot level:', error);
            // Handle errors if necessary
        } finally {
            setLoading(false); // Ensure loading state is always reset
        }
    };

    return (
        <>

            <div onClick={userData.autoTap === false ? handleOpen : undefined} className={`w-[90%] mx-auto flex items-center justify-between  rounded-2xl mt-4 border-b blurry px-2 py-4 ${userData.autoTap === true ? "grayscale" : ""}`}>
                <div className="flex items-center h-full">
                    <Image src={'/dog.png'} width={40} height={40} alt="ppx" />
                    <div className="ml-3 flex flex-col">
                        <h1 className="text-sm font-bold text-white">Bonk Bot</h1>
                        <p className="text-gray-300 font-light text-xs mt-1 flex "><Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1" /> <span className="mr-2"> 2,00,000 </span> {userData.autoTap === true && <span className="ml-1">| Bot Bot is Live</span>}</p>
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
                    {/* Background gradients */}


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
                        <Image src="/dog.png" width={80} height={80} alt="Multitap Image" />
                    </div>

                    {/* Title and details */}
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                        <h1 className="text-white text-2xl font-bold my-2">
                            Bonk Bot
                        </h1>
                        <p className="text-sm text-gray-300 text-center">
                            You are going to Start your auto tap bot, which will keep on increading your {userData?.perClick} Tokens, by each 5 seconds. <br /> ( Based on Multi Tap Level )
                        </p>
                        <div className="flex my-2 w-full items-center justify-center gap-[30px]">
                            <p className="flex text-white text-sm items-center font-semibold"> <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1 w-[20px]" />  2,00,000</p>
                        </div>
                    </Box>


                    <button onClick={handleConfirm} disabled={userData?.tokens < 200000 || userData.autoTap === true || loading} className="text-white text-md w-full text-center py-3 my-2 rounded-md bg-yellow-500 font-semibold disabled:bg-gray-400 disabled:text-white">
                        {
                            loading ? "Getting Over It..." : "Get It"
                        }
                    </button>
                </Box>
            </Modal></>
    );
};



export default AutoTapBoost