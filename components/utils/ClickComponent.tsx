"use client";

import {
  addStepsInDatabase,
  rechargeUserEnergy,
  addStepsBoost,
} from "@/libs/action";
import Image from "next/image";
import React, { useState, useRef, useEffect, useCallback } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "next/link";
import LevelText from "./LevelText";

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
  const [progress, setProgress] = useState<number>(
    (userData?.energyLimit / userData?.maxEnergyLimit) * 100
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [isRecharging, setIsRecharging] = useState<boolean>(true);
  const [isBoosterActive, setIsBoosterActive] = useState<boolean>(
    taps === "true"
  );
  const [boosterTimeLeft, setBoosterTimeLeft] = useState<number>(20);
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const pendingUpdatesRef = useRef<number>(0);
  const tapQueueRef = useRef<
    { x: number; y: number; energyRequired: number; isBooster: boolean }[]
  >([]);
  const timeoutRef = useRef<number | null>(null);
  const rechargeIntervalRef = useRef<number | null>(null);
  const energyRef = useRef<number>(userData?.energyLimit);

  const updateEnergyAndProgress = useCallback(
    (newEnergyLimit: number) => {
      energyRef.current = newEnergyLimit;
      setEnergyLimit(newEnergyLimit);
      setProgress((newEnergyLimit / userData?.maxEnergyLimit) * 100);
    },
    [userData?.maxEnergyLimit]
  );

  const processTapQueue = useCallback(async () => {
    while (tapQueueRef.current.length > 0 && energyRef.current > 0) {
      const { x, y, energyRequired, isBooster } = tapQueueRef.current.shift()!;
      if (energyRef.current >= energyRequired || isBooster) {
        updateEnergyAndProgress(
          isBooster ? energyRef.current : energyRef.current - energyRequired
        );
        pendingUpdatesRef.current += 1;
        setClicks((prev) => [
          ...prev,
          { click: userData?.perClick * (isBooster ? 5 : 1), x, y },
        ]);
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(async () => {
      if (pendingUpdatesRef.current > 0) {
        const result = isBoosterActive
          ? ((await addStepsBoost(pendingUpdatesRef.current)) as any)
          : ((await addStepsInDatabase(pendingUpdatesRef.current)) as any);

        if (result) {
          setTokens(result.tokens);
          updateEnergyAndProgress(result.energyLimit);
        }
        pendingUpdatesRef.current = 0;
      }
      setIsTapping(false);
      setIsRecharging(true);
    }, 200);

    setTimeout(() => setIsAnimating(false), 200);
  }, [isBoosterActive, updateEnergyAndProgress, userData?.perClick]);

  useEffect(() => {
    const fetchInitialEnergyStatus = async () => {
      const status = await rechargeUserEnergy();
      if (status) {
        updateEnergyAndProgress(status.energyLimit);
        setTokens(userData?.tokens);
      }
    };

    fetchInitialEnergyStatus();
  }, [updateEnergyAndProgress, userData?.tokens]);

  useEffect(() => {
    const fetchEnergyStatus = async () => {
      const status = await rechargeUserEnergy();
      if (status) {
        updateEnergyAndProgress(status.energyLimit);
      }
    };

    if (!isTapping && isRecharging) {
      fetchEnergyStatus();
      rechargeIntervalRef.current = window.setInterval(fetchEnergyStatus, 2000);

      return () => {
        if (rechargeIntervalRef.current) {
          clearInterval(rechargeIntervalRef.current);
          rechargeIntervalRef.current = null;
        }
      };
    }
  }, [isTapping, isRecharging, updateEnergyAndProgress]);

  useEffect(() => {
    if (isBoosterActive) {
      const countdown = setInterval(() => {
        setBoosterTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBoosterActive(false);
            clearInterval(countdown);
            setIsCooldown(true); // Start cooldown
            setTimeout(() => setIsCooldown(false), 1000); // End cooldown after 1 second
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isBoosterActive]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isCooldown) {
      return; // Do not allow taps during cooldown
    }

    setIsTapping(true);
    setIsAnimating(true);

    const touchPoints = Array.from(event.touches).map((touch) => ({
      x: touch.clientX,
      y: touch.clientY,
    }));

    const totalEnergyRequired = touchPoints.length * userData?.perClick;

    if (!isBoosterActive && energyRef.current < totalEnergyRequired) {
      console.warn("Not enough energy to tap");
      setIsAnimating(false);
      setIsTapping(false);
      return;
    }

    touchPoints.forEach(({ x, y }) => {
      tapQueueRef.current.push({
        x,
        y,
        energyRequired: userData?.perClick,
        isBooster: isBoosterActive,
      });
    });

    processTapQueue();

    const newTokens =
      tokens +
      userData?.perClick * (isBoosterActive ? 5 : 1) * touchPoints.length;
    setTokens(newTokens);
  };

  return (
    <div className="mt-2 flex items-center justify-center flex-col w-full px-3 mx-auto">
      <h5 className="number-font font-extrabold text-4xl text-white my-3 mb-[10px] w-full text-center">
        {tokens?.toLocaleString()}
      </h5>
      <LevelText user={user} />

      <div
        className={`w-[250px] h-[250px] relative my-2 mb-5 ${
          isAnimating ? "squeeze-animation" : ""
        }`}
        onTouchStart={handleTouchStart}
      >
        {isBoosterActive ? (
          <img src="/dance.gif" alt="Animated GIF" width="320" height="240" />
        ) : (
          <Image
            src={"/logo.png"}
            style={{ borderRadius: "70px" }}
            width={300}
            height={300}
            alt="token image"
          />
        )}
        {clicks.map(({ click, x, y }, index) => (
          <div
            key={index}
            className="indicator cursor-none"
            style={{ left: `${x}px`, top: `${y}px`, userSelect: "none" }}
          >
            +{click}
          </div>
        ))}
      </div>

      <div className="w-full flex items-end justify-between mt-[20px] mb-[5px] ">
        <p className=" text-white font-semibold text-sm flex">
          {energyLimit}/{userData?.maxEnergyLimit}{" "}
          {isBoosterActive && `- 5x Tap ${boosterTimeLeft}.`}
        </p>
        <Link
          href={"/boosts"}
          className="text-md text-white font-semibold flex gap-[10px] items-end"
        >
          Boosts
          <Image src={"/icon/bolt.png"} width={25} height={25} alt="boosts" />
        </Link>
      </div>
      <LinearProgressWithLabel value={progress} />
    </div>
  );
};

interface LinearProgressWithLabelProps {
  value: number; // Progress value as a percentage
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({
  value,
}) => {
  return (
    <div className="w-full">
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: "20px",
          width: "100%",
          borderRadius: "10px",
          "& .MuiLinearProgress-bar": {
            borderRadius: "10px",
            background:
              "linear-gradient(90deg, rgba(255, 255, 0, 1) 0%, rgba(255, 215, 0, 1) 100%)", // Yellowish gradient
          },
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      />
    </div>
  );
};

export default ClickComponent;
