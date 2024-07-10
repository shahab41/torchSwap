"use client";

import { claimSocialTask } from '@/libs/action';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';

interface SOCIALTASK {
    tasks: string;
    user: string;
}

interface TaskData {
    _id: string;
    name: string;
    redirectLink: string;
    tokens: number;
}

interface TaskState {
    timer: number | null;
    claimable: boolean;
    endTime?: number;
    loading?: boolean;
}

const SocialTasks: React.FC<SOCIALTASK> = ({ user, tasks }) => {
    const taskData: TaskData[] = JSON.parse(tasks);
    const userData = JSON.parse(user);
    const [tasksState, setTasksState] = useState<{ [key: string]: TaskState }>({});

    // Load tasks state from localStorage when component mounts
    useEffect(() => {
        const storedTasksState = localStorage.getItem('tasksState');
        if (storedTasksState) {
            const parsedTasksState: { [key: string]: TaskState } = JSON.parse(storedTasksState);
            setTasksState(parsedTasksState);
        }
    }, []);

    // Save tasks state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('tasksState', JSON.stringify(tasksState));
    }, [tasksState]);

    // Handle task timers and claimable state
    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];

        Object.keys(tasksState).forEach(taskId => {
            const task = tasksState[taskId];

            if (task.timer !== null && task.endTime) {
                const currentTime = Date.now();
                const remainingTime = Math.floor((task.endTime - currentTime) / 1000);

                if (remainingTime > 0) {
                    const interval = setInterval(() => {
                        setTasksState(prevState => ({
                            ...prevState,
                            [taskId]: {
                                ...prevState[taskId],
                                timer: Math.max(0, Math.floor((task.endTime! - Date.now()) / 1000))
                            }
                        }));
                    }, 1000);
                    intervals.push(interval);
                } else {
                    setTasksState(prevState => ({
                        ...prevState,
                        [taskId]: {
                            ...prevState[taskId],
                            timer: null,
                            claimable: true
                        }
                    }));
                }
            }
        });

        return () => {
            intervals.forEach(interval => clearInterval(interval));
        };
    }, [tasksState]);

    const handleStartTask = (taskId: string, link: string) => {
        const endTime = Date.now() + 30 * 1000;

        setTasksState(prevState => ({
            ...prevState,
            [taskId]: { timer: 30, claimable: false, endTime }
        }));

        window.open(link, '_blank');
    };

    const handleClaim = async (taskId: string) => {
        setTasksState(prevState => ({
            ...prevState,
            [taskId]: {
                ...prevState[taskId],
                loading: true
            }
        }));

        try {
            const result = await claimSocialTask(taskId) as any;

            if (result.success) {
                toast.success(' Task claimed successfully!');
                setTasksState(prevState => ({
                    ...prevState,
                    [taskId]: {
                        ...prevState[taskId],
                        loading: false,
                        claimable: false
                    }
                }));
            } else {
                console.error(result.message);
                setTasksState(prevState => ({
                    ...prevState,
                    [taskId]: {
                        ...prevState[taskId],
                        loading: false
                    }
                }));
            }
        } catch (error) {
            console.error("Error claiming task:", error);
            setTasksState(prevState => ({
                ...prevState,
                [taskId]: {
                    ...prevState[taskId],
                    loading: false
                }
            }));
        }
    };

    return (
        <div className='w-full mx-auto flex flex-col items-start justify-start mt-[20px] gap-[10px] max-h-[350px] overflow-scroll'>
            {taskData.map(e => {
                const taskState = tasksState[e._id] || { timer: null, claimable: false };
                const isClaimable = taskState.claimable;
                const isActive = taskState.timer !== null;
                const isLoading = taskState.loading;

                const claimed = userData.claimedInviteTasks.some(
                    (claimedTask: any) => claimedTask.task === e._id && claimedTask.claimed);

                return (
                    <div key={e._id} className='w-full flex flex-col py-4 px-3 rounded-2xl blurry'>
                        <div className='flex items-center justify-between w-full'>
                            <div className='flex items-center gap-[10px]'>
                                <Image src={'/icon/task.png'} width={40} height={40} alt="refer" />
                                <div className='ml-2'>
                                    <h1 className='text-md text-white font-semibold'>{e.name}</h1>
                                    <p className='mt-1 flex text-gray-300 font-light text-sm'>
                                        <Image src={'/token.png'} width={15} height={15} alt="token" className="mr-1" /> {e.tokens.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {
                                claimed ? (
                                    <button
                                        className='bg-yellow-500 text-white py-1 px-3 text-sm rounded-xl disabled:bg-gray-400 disabled:text-white'
                                        disabled
                                    >
                                        {"Claimed"}
                                    </button>
                                ) : (
                                    <>
                                        {isClaimable ? (
                                            <button
                                                className='bg-yellow-500 text-white py-1 px-3 text-sm rounded-xl disabled:bg-gray-400 disabled:text-white'
                                                onClick={() => handleClaim(e._id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <CircularProgress size={20} color="info" />
                                                ) : "Claim"}
                                            </button>
                                        ) : isActive ? (
                                            <button
                                                className='bg-gray-500 w-[80px] text-white py-1 px-3 text-sm rounded-xl disabled:bg-gray-400 disabled:text-white'
                                                disabled
                                            >
                                                {`${taskState.timer} sec`}
                                            </button>
                                        ) : (
                                            <button
                                                className='bg-yellow-500 text-white py-1 px-3 text-sm rounded-xl'
                                                onClick={() => handleStartTask(e._id, e.redirectLink)}
                                            >
                                                {"Start"}
                                            </button>
                                        )}
                                    </>
                                )
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SocialTasks;
