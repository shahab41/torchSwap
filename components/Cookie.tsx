"use client"
import { useEffect } from 'react';
import React from 'react'
import { saveChatInCookies } from '@/libs/action';
import { useSearchParams } from 'next/navigation';

const Cookie = () => {

    const searchParams = useSearchParams();

    const search: any = searchParams.get("user")!;

    useEffect(() => {
        const setCookie = async () => {
            await saveChatInCookies(search);
            return;
        }
        setCookie()
    }, []);
    return (
        <></>
    )
}

export default Cookie