"use client"

import React from 'react'
import toast from 'react-hot-toast'

const ShareButton = ({ code }: any) => {
    const shareLink = `https://t.me/BonkBoost_bot?start=${code}`

    const handleShare = () => {
        const shareText = `Hey Bro, I am gifting you 2500 BONK BOOST tokens, Let's become millionaire ${shareLink}`;
        if (typeof window !== 'undefined' && navigator && navigator.share) {
            navigator.share({
                title: 'BONK BOOST',
                text: shareText,
                url: shareLink
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        } else {
            // Fallback to copying to clipboard if the share API is not supported
            navigator?.clipboard?.writeText(shareText)
                .then(() => {
                    toast.success("Link copied to Clipboard!")
                })
                .catch((error) => {
                    console.error('Error copying text: ', error);
                });
        }
    }

    return (
        <button onClick={handleShare} className='py-4  px-5 w-[90%] mx-auto rounded-xl bg-white text-gray-700 font-semibold'>
            Invite Freinds
        </button>
    )
}

export default ShareButton