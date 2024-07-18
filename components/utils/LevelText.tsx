"use client";

import { leaguesTasks } from '@/libs/data';
import React, { useEffect, useState } from 'react';

interface ClickComponentProps {
    user: string; // User prop as string
}

const LevelText: React.FC<ClickComponentProps> = ({ user }) => {
    const userData = JSON.parse(user);
    const [league, setLeague] = useState<string>("");

    useEffect(() => {
        const determineLeague = () => {
            if (userData?.tokens < leaguesTasks[0].threshold) {
                return "Wood";
            }
            for (let i = leaguesTasks.length - 1; i >= 0; i--) {
                if (userData?.tokens >= leaguesTasks[i].threshold) {
                    return leaguesTasks[i].name;
                }
            }
            return "Wood";
        };

        setLeague(determineLeague());
    }, [userData?.tokens]);

    return (
        <p className='text-sm text-gray-300 font-semboldibold mb-3'> {league} {" >"}</p>
    );
};

export default LevelText;
