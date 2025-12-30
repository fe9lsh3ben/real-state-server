
const { cacheNotification, setFullNotificationCache, removeCachedNotification } = require("../functions/redis_notifications");
const { dbErrorHandler } = require('../libraries/utilities');
// 1. Create a new notification




const Note_Type = ['REQUEST', 'QUERY'];
const createNotification = (prisma) => async (req, res) => {

    try {

        const { Office_ID, Sender_ID, Note_Type, Content } = req.body;
        if (!Office_ID || !Sender_ID || !Note_Type || !Content) return res.status(400).send({ 'message': 'Office ID, Sender ID, Note Type, and Content are required!' });
        if (!Note_Type.includes(Note_Type)) return res.status(400).send({ 'message': 'Note Type must be one of the following: REQUEST, QUERY' });
        const note = await prisma.notification.create({
            data: { Sender_ID, Note_Type, Content, Office_ID }
        });

        await cacheNotification(Office_ID, note); // cache the latest 20

        res.status(200).send(note);
    } catch (error) {
        dbErrorHandler(res, error, 'createNotification');
        console.log(error.message)
    }
}

// 2. Get latest N notifications for an office (paginated)
const getNotifications = (prisma) => async (req, res, next) => {
    try {
        const { My_Office_ID, Curser = null } = req.body;
        const notes = await prisma.notification.findMany({
            where: { 
                Office_ID:My_Office_ID },
            orderBy: { Created_At: "desc" },
            take: 20,
            cursor: Curser ? { Note_ID: Curser } : undefined,
            skip: Curser ? 1 : 0,
        });
        // FIX: Save to cache if this is the first page
        if (!Curser && notes.length > 0) {
            // We use a helper to overwrite the full list for this office
            await setFullNotificationCache(My_Office_ID, notes);
        }
        return res.status(200).json(notes);
    } catch (error) {
        console.log(error);
        dbErrorHandler(res, error, 'getNotifications');
    }
};


// 3. Mark a notification as read
const markNotificationRead = (prisma) => async (req, res) => {
    try {
        const { Note_ID, My_Office_ID } = req.body;

        // mark as read
        await prisma.notification.update({
            where: { Note_ID },
            data: { Read: true }
        });

        // remove from Redis cache if exists
        removeCachedNotification(My_Office_ID, Note_ID);

        // send minimal response to avoid hanging
        res.sendStatus(204); // 204 = No Content
    } catch (error) {
        dbErrorHandler(res, error, 'markNotificationRead');
    }
};


// 4. Count unread notifications
const countUnread = (prisma) => async (req, res) => {
    try {
        const { My_Office_ID } = req.body;
        const count = await prisma.notification.count({
            where: {
                Office_ID: My_Office_ID,
                Read: false
            }
        });
        res.status(200).json({ 'Unread': count });
    } catch (error) {
        console.log(error)
        dbErrorHandler(res, error, 'countUnread');
    }
};




module.exports = {
    createNotification,
    getNotifications,
    markNotificationRead,
    countUnread,
}