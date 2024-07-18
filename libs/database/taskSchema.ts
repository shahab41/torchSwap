import mongoose from "mongoose";

// chat id 5195131141
const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    redirectLink: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tokens: {
        type: Number,
    }
})


// const User = mongoose.model('User', userSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task; 