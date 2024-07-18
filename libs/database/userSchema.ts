import mongoose from "mongoose";

// chat id 5195131141
const userSchema = new mongoose.Schema({
    chat: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    tonWallet: {
        type: String,
    },
    inviteCode: {
        type: String,
        unique: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    totalRefers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    commissionEarned: {
        type: Number,
        default: 0
    },
    tokens: {
        type: Number,
        default: 2500
    },
    perClick: {
        type: Number,
        default: 1
    },
    maxEnergyLimit: {
        type: Number,
        default: 500
    },
    energyLimit: {
        type: Number,
        default: 500
    },
    rechargeSpeed: {
        type: Number,
        default: 1,
        min: 1
    },
    autoTap: {
        type: Boolean,
        default: false
    },
    lastAutoTapClaim: {
        type: Date,
        default: Date.now,
    },
    lastEnergyUpdate: {
        type: Date,
        default: Date.now
    },
    dailyBoosters: { type: Number, default: 3 },
    multipleTapBoosters: { type: Number, default: 3 },
    spinBooster: { type: Number, default: 5 },
    lastBoosterReset: { type: Date, default: Date.now },
    claimedInviteTasks: [
        {
            task: {
                type: String,
                required: true
            },
            claimed: {
                type: Boolean,
                default: false
            }
        }
    ]
})

userSchema.pre("save", async function (next: any) {
    try {

        // If inviteCode is not set, generate one
        if (!this.inviteCode as any) {
            this.inviteCode = generateInviteCode() as any;
        }

        next();
    } catch (error: any) {
        next(error); // Pass any errors to the next middleware
    }
});

userSchema.pre('save', function (next) {
    this.increment(); // increments the version key
    next();
});

// Generate invite code
function generateInviteCode() {
    const length = 8;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let inviteCode = '';

    // Generate a random string
    for (let i = 0; i < length; i++) {
        inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return inviteCode;
}


// const User = mongoose.model('User', userSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 