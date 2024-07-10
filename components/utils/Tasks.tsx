"use client";

import { claimInviteTask, claimLeaguesTask } from '@/libs/action';
import { leaguesTasks as initialLeaguesTasks, referalTasks } from '@/libs/data';
import { LinearProgress, CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { Suspense, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SocialTasks from './SocialTasks';

interface TasksProps {
    user: string;
    tasks: string; // User prop as string
}

const Tasks: React.FC<TasksProps> = ({ user, tasks }) => {
    const userData = JSON.parse(user);

    const [task, setTask] = useState<string>('soc');
    const [claimedTasks, setClaimedTasks] = useState<string[]>(userData?.claimedInviteTasks.map((task: any) => task.task));
    const [userTokens, setUserTokens] = useState<number>(userData.tokens);
    const [leaguesTasks, setLeaguesTasks] = useState(initialLeaguesTasks);
    const [loadingTask, setLoadingTask] = useState<string | null>(null); // State to track the loading task

    useEffect(() => {
        // Filter out already claimed league tasks on initial render
        setLeaguesTasks(initialLeaguesTasks.filter((task: any) => !claimedTasks.includes(task.taskId.toString())));
    }, [claimedTasks]);

    const handleClaim = async (taskId: string) => {
        setLoadingTask(taskId); // Set the loading task
        try {
            const result = await claimInviteTask(taskId) as any;

            if (result.success) {
                setClaimedTasks(prev => [...prev, taskId.toString()]);
                setUserTokens(result.tokens);
                toast.success('Successfully claimed task!');
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error("Error claiming task:", error);
        } finally {
            setLoadingTask(null); // Reset the loading task
        }
    };

    const handleLeagueClaim = async (taskId: string) => {
        setLoadingTask(taskId); // Set the loading task
        try {
            const result = await claimLeaguesTask(taskId) as any;

            if (result.success) {
                setClaimedTasks(prev => [...prev, taskId.toString()]);
                setUserTokens(result.tokens);
                setLeaguesTasks(prev => prev.filter((task: any) => task.taskId !== taskId));
                toast.success('Leagues Task claimed successfully!');
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error("Error claiming task:", error);
        } finally {
            setLoadingTask(null); // Reset the loading task
        }
    };

    return (
        <Suspense>
            <div>
                <div className='w-[90%] rounded-3xl mx-auto my-2 shadow-md py-2 flex items-center justify-between blurry px-6'>
                    <button onClick={() => setTask('ref')} className={`outline-none text-md text-white font-bold py-4 flex-none ${task === 'ref' ? "text-yellow-500" : ""}`}>
                        Referral
                    </button>
                    <button onClick={() => setTask('soc')} className={`outline-none text-md text-white font-bold py-4 flex-none ${task === 'soc' ? "text-yellow-500" : ""}`}>
                        Social
                    </button>
                    <button onClick={() => setTask('leg')} className={`outline-none text-md text-white font-bold py-4 flex-none ${task === 'leg' ? "text-yellow-500" : ""}`}>
                        Leagues
                    </button>
                </div>
                {
                    task === "ref" && <div className='w-[90%] mx-auto flex flex-col items-start justify-start mt-[20px] gap-[10px] max-h-[350px] overflow-scroll'>
                        {
                            referalTasks.filter((task: any) => !claimedTasks.includes(task.taskId.toString())).map((e: any) => {
                                const numString = e.taskId.toString();

                                const canClaim = userData.totalRefers.length >= e.invite;

                                return (
                                    <div key={e.taskId} className='w-full flex flex-col py-3 px-3 rounded-2xl blurry'>
                                        <div className='flex items-center justify-between w-full'>
                                            <div className='flex items-center gap-[10px]'>
                                                <Image src={'/icon/refer.png'} width={40} height={40} alt="refer" />
                                                <div className='ml-2'>
                                                    <h1 className='text-sm text-white font-semibold'>{e.name}</h1>
                                                    <p className='mt-1 flex text-gray-300 font-light text-xs'>
                                                        <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1" /> {e.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className='bg-yellow-500 text-white py-1 px-3 text-sm rounded-2xl disabled:bg-gray-400 disabled:text-white'
                                                onClick={() => handleClaim(e.taskId)}
                                                disabled={!canClaim || loadingTask === e.taskId}
                                            >
                                                {loadingTask === e.taskId ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : "Claim"}
                                            </button>
                                        </div>
                                        <div className='mt-4 mb-1'>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(100, (userData?.totalRefers?.length / e.invite) * 100)}
                                                sx={{
                                                    height: '20px',
                                                    width: "100%",
                                                    borderRadius: '10px',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: '10px',
                                                        background: 'linear-gradient(90deg, rgba(255, 255, 0, 0.9) 0%, rgba(255, 215, 0, 1) 100%)', // Yellowish gradient
                                                    },
                                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                }
                {
                    task === "soc" && <div className='w-[90%] mx-auto flex flex-col items-start justify-start mt-[20px] gap-[10px] max-h-[350px] overflow-scroll'>
                        <>
                            <SocialTasks tasks={tasks} user={user} />
                        </>
                    </div>
                }
                {
                    task === "leg" &&
                    <div className='w-[90%] mx-auto flex flex-col items-start justify-start mt-[20px] gap-[10px] max-h-[350px] overflow-scroll'>
                        {
                            leaguesTasks.map((e: any) => {
                                const numString = e.taskId.toString();

                                const canClaim = userData.tokens >= e.threshold;

                                return (
                                    <div key={e.taskId} className='w-full flex flex-col py-3 px-3 rounded-2xl blurry'>
                                        <div className='flex items-center justify-between w-full'>
                                            <div className='flex items-center gap-[10px]'>
                                                <Image src={'/icon/tr.png'} width={40} height={40} alt="league" />
                                                <div className='ml-2'>
                                                    <h1 className='text-sm text-white font-semibold'>{e.name}</h1>
                                                    <p className='mt-1 flex text-gray-300 font-light text-xs'>
                                                        <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1" /> {e.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className='bg-yellow-500 text-white py-1 px-3 text-sm rounded-2xl disabled:bg-gray-400 disabled:text-white'
                                                onClick={() => handleLeagueClaim(e.taskId)}
                                                disabled={!canClaim || loadingTask === e.taskId}
                                            >
                                                {loadingTask === e.taskId ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : "Claim"}
                                            </button>
                                        </div>
                                        <div className='mt-4 mb-1'>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(100, (userData?.tokens / e.threshold) * 100)}
                                                sx={{
                                                    height: '20px',
                                                    width: "100%",
                                                    borderRadius: '10px',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: '10px',
                                                        background: 'linear-gradient(90deg, rgba(255, 255, 0, 0.9) 0%, rgba(255, 215, 0, 1) 100%)', // Yellowish gradient
                                                    },
                                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                }
            </div>
        </Suspense>
    );
};

export default Tasks;
