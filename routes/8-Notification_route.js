
const { express, dbErrorHandler } = require('../libraries/utilities');
const { prisma } = require('../libraries/prisma_utilities');


const {
    createNotification,
    getNotifications,
    markNotificationRead,
    countUnread,

    tokenMiddlewere,
    officeAuthentication
} = require('../libraries/functions&middlewares_lib');

const {
    getCachedNotifications
} = require('../functions/redis_notifications');

const Notification = express.Router();

/** Request's body example: {"Office_ID" : 12, "Sender_ID":2, "Note_Type": "REQUEST", "Content" : "need a flat" }
    **/

Notification.route('/')

.post(tokenMiddlewere, createNotification(prisma))

// query parameters : 'http://127.0.0.1:3050/notification?Office_ID=1
// query parameters : 'http://127.0.0.1:3050/notification?Office_ID=1&Curser10


.get(tokenMiddlewere, officeAuthentication, async (req, res, next) => {
        try {
            const notes = await getCachedNotifications(req.body.Office_ID);
            if (notes.length > 0) {
                return res.status(200).json(notes); // send cached response
            }
            next(); // cache miss → go to DB middleware
        } catch (error) {
            dbErrorHandler(res, error, 'createNotification');
        }
    }, getNotifications(prisma)) // middleware that fetches from DB


/** Request's body example: {"Office_ID" : 1, "Note_ID" : 1}
    **/

.put(tokenMiddlewere, officeAuthentication, markNotificationRead(prisma));

// query parameters : 'http://127.0.0.1:3050/notification/count-unread?Office_ID=3
Notification.route('/count-unread')
    .get(tokenMiddlewere, officeAuthentication, countUnread(prisma));

module.exports = { Notification }