"use server"

import { cookies } from "next/headers";
import connectToDb from "../database/db";
import User from "../database/userSchema";
import { revalidatePath } from "next/cache";
import { leaguesTasks, referalTasks } from "../data";
import Task from "../database/taskSchema";

export async function getUser(chat: string) {
    try {
        await connectToDb();

        const user = await User.findOne({ chat }).populate("totalRefers", ["tokens", "name", "chat", "totalRefers"]);

        revalidatePath('/stats', "page")
        return user;
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function saveChatInCookies(chat: any) {
    try {
        console.log(chat);
        await cookies().set({
            name: 'chat',
            value: chat,
            httpOnly: true,
            path: '/',
        });
        return true;
    } catch (error) {
        console.log(error);
        return;
    }
}

export const getUserEnergyStatus = async () => {
    try {
        const cookie: any = await cookies().get("chat");

        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date().getTime();
        const timeElapsed = (now - new Date(user.lastEnergyUpdate).getTime()) / 1000; // time in seconds
        const rechargeAmount = Math.floor(timeElapsed * user.rechargeSpeed);

        const energyLimit = Math.min(user.maxEnergyLimit, user.energyLimit + rechargeAmount);

        return {
            energyLimit,
            maxEnergyLimit: user.maxEnergyLimit,
            rechargeSpeed: user.rechargeSpeed,
        };
    } catch (error) {
        console.error("Error fetching user energy status:", error);
        return null;
    }
};

export async function addStepsInDatabase(numClicks: number = 1) {
    try {
        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error('User not found');
        }

        user.tokens += user.perClick * numClicks;
        user.energyLimit = Math.max(0, user.energyLimit - user.perClick * numClicks);
        user.lastEnergyUpdate = new Date();
        await user.save();

        return {
            tokens: user.tokens,
            energyLimit: user.energyLimit,
            maxEnergyLimit: user.maxEnergyLimit,
        };
    } catch (error) {
        console.error('Error adding steps to database:', error);
        return null;
    }
}

export const rechargeUserEnergy = async () => {
    try {
        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error('User not found');
        }

        const now = new Date().getTime();
        const lastUpdate = new Date(user.lastEnergyUpdate).getTime();
        const timeElapsed = (now - lastUpdate) / 1000; // time in seconds
        const rechargeAmount = Math.floor(timeElapsed * user.rechargeSpeed);

        if (user.energyLimit >= user.maxEnergyLimit) {
            return null;
        }

        if (rechargeAmount > 0) {
            user.energyLimit = Math.min(user.maxEnergyLimit, user.energyLimit + rechargeAmount);
            user.lastEnergyUpdate = new Date(now);
            await user.save();
        }


        return {
            energyLimit: user.energyLimit,
            maxEnergyLimit: user.maxEnergyLimit,
            rechargeSpeed: user.rechargeSpeed,
        };
    } catch (error) {
        console.error("Error recharging user energy:", error);
        return null;
    }
};

export const addStepsBoost = async (numClicks: number = 1) => {

    try {
        await connectToDb();
        const cookie: any = await cookies().get("chat");

        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error('User not found');
        }

        user.tokens += user.perClick * numClicks * 5;
        await user.save();
        revalidatePath('/', "page");
        return true;
    } catch (error) {
        return;
    }
}


export const upgradePerClickLevel = async (nextLevel: number, cost: number) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.tokens < cost) {
            throw new Error("Not enough tokens");
        }

        user.tokens -= cost;
        user.perClick = nextLevel;
        await user.save();
        revalidatePath('/', "page")

        return true;
    } catch (error) {
        console.error("Error upgrading perClick level:", error);
        return null;
    }
};

export const upgradeRechargingSpeed = async (nextLevel: number, cost: number) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.tokens < cost) {
            throw new Error("Not enough tokens");
        }

        user.tokens -= cost;
        user.rechargeSpeed = nextLevel;
        await user.save();

        revalidatePath('/', "page")
        return true;
    } catch (error) {
        console.error("Error upgrading perClick level:", error);
        return null;
    }
};

export const upgradeEnergyLimit = async (nextLevel: number, cost: number) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.tokens < cost) {
            throw new Error("Not enough tokens");
        }

        user.tokens -= cost;
        user.maxEnergyLimit = 500 * nextLevel; // Incrementing by 500 points per level
        user.energyLimit = user.maxEnergyLimit;
        await user.save();

        revalidatePath('/', "page")
        return true;
    } catch (error) {
        console.error("Error upgrading energy limit:", error);
        throw error; // Rethrow the error to be caught in the component
    }
};

export const claimInviteTask = async (taskId: string) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        const task = referalTasks.find((task: any) => task.taskId === taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        const isTaskClaimed = user.claimedInviteTasks.some(
            (claimedTask: any) => claimedTask.task === task.taskId && claimedTask.claimed
        );

        if (isTaskClaimed) {
            throw new Error("Task already claimed");
        }

        if (user.totalRefers.length < task.invite) {
            throw new Error("Invite threshold not met");
        }

        user.tokens += task.amount;
        user.claimedInviteTasks.push({ task: task.taskId, claimed: true });
        await user.save();

        revalidatePath('/', "page");
        revalidatePath('/task', "page");
        revalidatePath('/boosts', "page");
        revalidatePath('/fren', "page");

        return {
            success: true,
            message: "Task claimed successfully",
            tokens: user.tokens,
        };
    } catch (error) {
        console.error("Error claiming invite task:", error);
        return;
    }
};

export const claimLeaguesTask = async (taskId: string) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        const task = leaguesTasks.find((task: any) => task.taskId === taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        const isTaskClaimed = user.claimedInviteTasks.some(
            (claimedTask: any) => claimedTask.task === task.taskId && claimedTask.claimed
        );

        if (isTaskClaimed) {
            throw new Error("Task already claimed");
        }

        if (user.tokens < task.threshold) {
            throw new Error("Invite threshold not met");
        }

        user.tokens += task.amount;
        user.claimedInviteTasks.push({ task: task.taskId, claimed: true });
        await user.save();

        revalidatePath('/', "page");
        revalidatePath('/task', "page");
        revalidatePath('/boosts', "page");
        revalidatePath('/fren', "page");

        return {
            success: true,
            message: "Task claimed successfully",
            tokens: user.tokens,
        };
    } catch (error) {
        console.error("Error claiming invite task:", error);
        return;
    }
};

export const getUserBoosters = async () => {
    try {
        await connectToDb();

        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        const currentTime = new Date();
        const resetTime = new Date();
        resetTime.setUTCHours(1, 0, 0, 0); // 1 am UTC

        // Compare dates without time component
        const isSameDay = (date1: any, date2: any) =>
            date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate();

        // Check if last reset was before the current reset time
        if (!user.lastBoosterReset || !isSameDay(user.lastBoosterReset, currentTime)) {
            user.dailyBoosters = 3; // Reset daily boosters to 3
            user.multipleTapBoosters = 3; // Reset daily boosters to 3
            user.spinBooster = 5; // Reset spin to 5
            user.lastBoosterReset = currentTime;
            await user.save();
        }

        return { dailyBoosters: user.dailyBoosters, multipleTapBoosters: user.multipleTapBoosters, nextReset: resetTime, spinBooster: user.spinBooster };
    } catch (error) {
        console.error("Error fetching user boosters:", error);
        return null;
    }
};

export const useBooster = async () => {
    try {
        await connectToDb();

        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (user.dailyBoosters === 0) {
            return { message: "No Boosters Left!", success: false };
        }

        user.dailyBoosters -= 1;
        user.energyLimit = user.maxEnergyLimit;
        await user.save();
        console.log(user);
        return { success: true, dailyBoosters: user.dailyBoosters };

    } catch (error) {
        console.error(error);
        return null;
    }
};

export const useMultipleTapBooster = async () => {
    try {
        await connectToDb();

        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (user.multipleTapBoosters === 0) {
            return { message: "No Boosters Left!", success: false };
        }

        // Calculate cookie expiration time (20 seconds from now)
        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + 20);

        await cookies().set({
            name: 'taps',
            value: 'true',
            httpOnly: true,
            path: '/',
            expires: expirationTime // seconds
        });

        user.multipleTapBoosters -= 1;
        await user.save();
        console.log(user);
        return { success: true, multipleTapBoosters: user.multipleTapBoosters };
    } catch (error) {
        return;
    }
}


// ------------------------------ TASKS -------------------------------------

export const getTasks = async () => {
    try {
        await connectToDb();
        const tasks = await Task.find();
        return tasks;
    } catch (error) {
        console.log(error);
        return;
    }
}

export const createTasks = async (formData: any) => {
    try {
        const { name, price, link } = formData;
        const tasks = await Task.create({ name, tokens: price, redirectLink: link });
        revalidatePath("/admin/task", 'page')
        revalidatePath("/task", 'page')
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const deleteTasks = async (id: any) => {
    try {
        const tasks = await Task.findByIdAndDelete(id);
        if (!tasks) {
            return false;
        }
        revalidatePath("/admin/task", 'page')
        revalidatePath("/task", 'page')
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const claimSocialTask = async (taskId: string) => {
    try {
        await connectToDb();

        const cookie: any = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            throw new Error("User not found");
        }

        const task = await Task.findById(taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        const isTaskClaimed = user.claimedInviteTasks.some(
            (claimedTask: any) => claimedTask.task === task._id && claimedTask.claimed
        );

        if (isTaskClaimed) {
            throw new Error("Task already claimed");
        }

        user.tokens += task.tokens;
        user.claimedInviteTasks.push({ task: task._id, claimed: true });
        await user.save();

        revalidatePath('/', "page");
        revalidatePath('/task', "page");
        revalidatePath('/boosts', "page");
        revalidatePath('/fren', "page");

        return {
            success: true,
            message: "Task claimed successfully",
            tokens: user.tokens,
        };
    } catch (error) {
        console.error("Error claiming invite task:", error);
        return;
    }
};

export const getStats = async () => {
    try {
        await connectToDb();
        const users = await User.find();

        return users;
    } catch (error) {
        return null;
    }
}

// ---------------- AUTO TAP BOT ---------------

export const startAutoBot = async () => {
    try {
        await connectToDb();
        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user) {
            return;
        }
        if (user.tokens < 200000) {
            return;
        }
        user.autoTap = true;
        user.tokens -= 200000;
        user.lastAutoTapClaim = new Date();
        await user.save();
        revalidatePath('/', "page")
        revalidatePath('/boosts', "page")
        return true;
    } catch (error) {
        return false;
    }
}

export const calculateAutoTapTokens = async () => {
    try {
        await connectToDb();
        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });

        if (!user || !user.autoTap) {
            return { tokens: 0, message: "AutoTap is not active." };
        }

        const now = new Date();
        const lastClaim = user.lastAutoTapClaim;

        if (!lastClaim) {
            return { tokens: 0, message: "No previous claim or energy update found." };
        }

        const timeDiffSeconds = (now.getTime() - new Date(lastClaim).getTime()) / 1000;
        const tokensToAward = Math.min(
            Math.floor(timeDiffSeconds / 5) * user.perClick,
            200000
        );

        revalidatePath('/', "page")
        return { tokens: tokensToAward, message: "Tokens calculated successfully." };
    } catch (error) {
        console.error("Error calculating auto-tap tokens:", error);
        return { tokens: 0, message: "Error calculating tokens." };
    }
};

export const claimAutoTapTokens = async () => {
    try {
        await connectToDb();
        const cookie = await cookies().get("chat");
        const user = await User.findOne({ chat: cookie?.value });


        if (!user || !user.autoTap) {
            return { success: false, message: "AutoTap is not active." };
        }

        const { tokens: tokensToAward } = await calculateAutoTapTokens();
        user.tokens += tokensToAward;
        user.lastAutoTapClaim = new Date();
        await user.save();

        revalidatePath('/', "page")
        return { success: true, tokens: tokensToAward, message: "Tokens claimed successfully." };
    } catch (error) {
        console.error("Error claiming auto-tap tokens:", error);
        return { success: false, message: "Error claiming tokens." };
    }
};
