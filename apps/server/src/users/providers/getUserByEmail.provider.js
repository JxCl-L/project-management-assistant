const User = require("../user.schema.js");

// async function getUserByEmail(email){
//     try {
//         const user = await User.findOne({ email: email });
//         return user;
//     } catch (error) {
//         throw error; // Important: when no user is found, it returns null silently. Then your login code tries to access user.password on null, causing the crash
//     }
// }
async function getUserByEmail(email) {
    try {
        console.log("🔍 Searching for user:", email);
        const user = await User.findOne({ email: email });
        console.log("📊 User found:", !!user);
        return user; // This can be null if user doesn't exist
    } catch (error) {
        console.error("❌ Database error in getUserByEmail:", error);
        throw error; // IMPORTANT: throw, don't return
    }
}

module.exports = getUserByEmail; 