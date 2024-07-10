const mongoose = require("mongoose");

const connectToDb = async () => {
    try {
        const db_uri = "mongodb+srv://devgan:devgan123@cluster0.rdfd6t7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        if (!db_uri) return console.log('Mongodb uri not found');
        const { connection } = await mongoose.connect(db_uri)
        console.log(`Server connected to ${connection.host}`)
        return connection;
    } catch (error) {
        console.log(`Error ${error}`)
    }
}
export default connectToDb;