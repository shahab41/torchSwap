"use client"
import React, { useState, useEffect } from "react";
import { Button, Modal, Box, Typography, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import toast from "react-hot-toast";
import { calculateAutoTapTokens, claimAutoTapTokens } from "@/libs/action";

const AutoTapClaimModal = () => {
    const [open, setOpen] = useState(false);
    const [tokens, setTokens] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        const result = await calculateAutoTapTokens();
        setTokens(result.tokens);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        sessionStorage.setItem("autoTapModalShown", "true"); // Use sessionStorage for session-based storage
    };

    const handleClaim = async () => {
        try {
            setLoading(true);
            const result = await claimAutoTapTokens();
            if (result.success) {
                setLoading(false);
                toast.success(`Claimed ${result.tokens} tokens!`);
                handleClose();
            } else {
                setLoading(false);
                handleClose();
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error claiming tokens:", error);
            toast.error("Error claiming tokens.");
            handleClose();
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    useEffect(() => {
        const autoTapModalShown = sessionStorage.getItem("autoTapModalShown");
        if (!autoTapModalShown) {
            handleOpen();
        }
    }, []);

    return (
        <Modal open={open} onClose={handleClose}>
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
                    <FontAwesomeIcon icon={faClose} />
                </IconButton>
                <div className="flex justify-center items-center mt-4">
                    <Image src="/dog.png" width={80} height={80} alt="Auto Tap Image" />
                </div>
                <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                    <h1 className="text-white text-3xl font-bold">Claim Tokens</h1>
                    <p className="text-sm my-1 text-center text-gray-200">When you were not here, someone was working hard for you to gift you {tokens?.toLocaleString()}.</p>

                    <button onClick={handleClaim} disabled={loading || tokens === 0} className="text-white text-md w-full text-center py-3 my-2 rounded-md bg-yellow-500 font-semibold disabled:bg-gray-400 disabled:text-white">
                        {loading ? "Claiming..." : "Claim Tokens"}
                    </button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AutoTapClaimModal;
