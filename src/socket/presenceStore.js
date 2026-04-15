// In-memory store for task room presence
// Structure: Map<taskId, Map<userId, { userId, firstName, lastName, socketIds: Set<socketId> }>>
//
// Supports multiple tabs per user — a user is only removed from the presence
// list when ALL their sockets leave the room.

const rooms = new Map();

function addSocket(taskId, userId, userData, socketId) {
    if (!rooms.has(taskId)) {
        rooms.set(taskId, new Map());
    }
    const room = rooms.get(taskId);
    if (room.has(userId)) {
        room.get(userId).socketIds.add(socketId);
    } else {
        room.set(userId, {
            userId: userData.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            socketIds: new Set([socketId]),
        });
    }
}

function removeSocket(taskId, userId, socketId) {
    const room = rooms.get(taskId);
    if (!room) return;
    const user = room.get(userId);
    if (!user) return;

    user.socketIds.delete(socketId);
    if (user.socketIds.size === 0) {
        room.delete(userId);
    }
    if (room.size === 0) {
        rooms.delete(taskId);
    }
}

function getUsers(taskId) {
    const room = rooms.get(taskId);
    if (!room) return [];
    return Array.from(room.values()).map(({ userId, firstName, lastName }) => ({
        userId,
        firstName,
        lastName,
    }));
}

module.exports = { addSocket, removeSocket, getUsers };
