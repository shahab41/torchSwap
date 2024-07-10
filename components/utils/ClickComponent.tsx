"use client";

import { addStepsInDatabase, rechargeUserEnergy, addStepsBoost } from '@/libs/action';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Link from 'next/link';
import LevelText from './LevelText';

interface ClickComponentProps {
    user: string;
    taps: string;
}

interface Click {
    click: number;
    x: number;
    y: number;
}

const ClickComponent: React.FC<ClickComponentProps> = ({ user, taps }) => {
    const userData = JSON.parse(user);
    const [tokens, setTokens] = useState<number>(userData?.tokens);
    const [clicks, setClicks] = useState<Click[]>([]);
    const [energyLimit, setEnergyLimit] = useState<number>(userData?.energyLimit);
    const [progress, setProgress] = useState<number>((userData?.energyLimit / userData?.maxEnergyLimit) * 100);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [isTapping, setIsTapping] = useState<boolean>(false);
    const [isRecharging, setIsRecharging] = useState<boolean>(true);
    const [isBoosterActive, setIsBoosterActive] = useState<boolean>(taps === "true");
    const [boosterTimeLeft, setBoosterTimeLeft] = useState<number>(20);
    const pendingUpdatesRef = useRef<number>(0);
    const tapQueueRef = useRef<{ x: number; y: number; energyRequired: number }[]>([]);
    const timeoutRef = useRef<number | null>(null);
    const rechargeTimeoutRef = useRef<number | null>(null);

    const updateEnergyAndProgress = useCallback((newEnergyLimit: number) => {
        setEnergyLimit(newEnergyLimit);
        setProgress((newEnergyLimit / userData?.maxEnergyLimit) * 100);
    }, [userData?.maxEnergyLimit]);

    const processTapQueue = useCallback(async () => {
        while (tapQueueRef.current.length > 0 && (energyLimit > 0 || isBoosterActive)) {
            const { x, y, energyRequired } = tapQueueRef.current.shift()!;
            if (energyLimit >= energyRequired || isBoosterActive) {
                updateEnergyAndProgress(isBoosterActive ? energyLimit : energyLimit - energyRequired);
                pendingUpdatesRef.current += 1;
                setClicks(prev => [...prev, { click: userData?.perClick * (isBoosterActive ? 5 : 1), x, y }]);
            }
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(async () => {
            if (pendingUpdatesRef.current > 0) {
                let result: {
                    tokens: number;
                    energyLimit: number;
                    maxEnergyLimit: number;
                } | null;

                if (isBoosterActive) {
                    result = await addStepsBoost(pendingUpdatesRef.current) as any;
                } else {
                    result = await addStepsInDatabase(pendingUpdatesRef.current);
                }

                if (result) {

                    setTokens(result.tokens);
                    updateEnergyAndProgress(result.energyLimit);
                }
                pendingUpdatesRef.current = 0;
            }
            setIsTapping(false);
            setIsRecharging(true);
        }, 600);

        setTimeout(() => setIsAnimating(false), 500);
    }, [energyLimit, isBoosterActive, updateEnergyAndProgress]);

    const fetchEnergyStatus = useCallback(async () => {
        const status = await rechargeUserEnergy();
        if (status) {
            updateEnergyAndProgress(status.energyLimit);
        }
    }, [updateEnergyAndProgress]);

    useEffect(() => {
        fetchEnergyStatus();
    }, [fetchEnergyStatus]);

    useEffect(() => {
        if (!isTapping && isRecharging) {
            rechargeTimeoutRef.current = window.setTimeout(fetchEnergyStatus, 2000);

            return () => {
                if (rechargeTimeoutRef.current) {
                    clearTimeout(rechargeTimeoutRef.current);
                    rechargeTimeoutRef.current = null;
                }
            };
        }
    }, [isTapping, isRecharging, fetchEnergyStatus]);

    useEffect(() => {
        if (isBoosterActive) {
            const countdown = setInterval(() => {
                setBoosterTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsBoosterActive(false);
                        clearInterval(countdown);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [isBoosterActive]);

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        setIsTapping(true);
        setIsAnimating(true);

        const touchPoints = Array.from(event.touches).map(touch => ({
            x: touch.clientX,
            y: touch.clientY,
        }));

        const totalEnergyRequired = touchPoints.length * userData?.perClick;

        if (!isBoosterActive && energyLimit < totalEnergyRequired) {
            console.warn('Not enough energy to tap');
            setIsAnimating(false);
            setIsTapping(false);
            return;
        }

        touchPoints.forEach(({ x, y }) => {
            tapQueueRef.current.push({ x, y, energyRequired: userData?.perClick });
        });

        setTokens((prevTokens) => {
            const newTokens = prevTokens + userData?.perClick * (isBoosterActive ? 5 : 1) * touchPoints.length;
            return isNaN(newTokens) ? prevTokens : newTokens;
        });

        processTapQueue();
    };

    return (
        <div className='mt-2 flex items-center justify-center flex-col w-full px-3 mx-auto'>
            <h5 className="number-font font-extrabold text-4xl text-white my-3 mb-[10px] w-full text-center">
                {tokens?.toLocaleString()}
            </h5>
            <LevelText user={user} />

            <div className={`w-[250px] h-[250px] relative my-2 mb-5 ${isAnimating ? 'squeeze-animation' : ''}`} onTouchStart={handleTouchStart}>
                {isBoosterActive ? <img src="/dance.gif" alt="Animated GIF" width="320" height="240" /> :
                    <Image src={'/logo.png'} width={300} height={300} alt='token image' />}
                {clicks.map(({ click, x, y }, index) => (
                    <div key={index} className="indicator cursor-none" style={{ left: `${x}px`, top: `${y}px`, userSelect: 'none' }} >
                        +{click}
                    </div>
                ))}
            </div>

            <div className='w-full flex items-end justify-between mt-[20px] mb-[5px] '>
                <p className=' text-white font-semibold text-sm flex'>
                    {energyLimit}/{userData?.maxEnergyLimit}    {isBoosterActive && `- 5x Tap ${boosterTimeLeft}.`}
                </p>
                <Link href={'/boosts'} className='text-md text-white font-semibold flex gap-[10px] items-end'>Boosts<Image src={"/icon/bolt.png"} width={25} height={25} alt="boosts" /></Link>
            </div>
            <LinearProgressWithLabel value={progress} />
        </div>
    );
};

interface LinearProgressWithLabelProps {
    value: number; // Progress value as a percentage
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({ value }) => {
    return (
        <div className='w-full'>
            <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                    height: '20px',
                    width: "100%",
                    borderRadius: '10px',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: '10px',
                        background: 'linear-gradient(90deg, rgba(255, 255, 0, 1) 0%, rgba(255, 215, 0, 1) 100%)', // Yellowish gradient
                    },
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                }}
            />
        </div>
    );
};

export default ClickComponent;
