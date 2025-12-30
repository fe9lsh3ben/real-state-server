

const logAdDeletion = (adId, tableName, userId) => {
    prisma.deletionLog.create({
        data: {
            Record_ID: adId,
            Table_Name: tableName,
            Deleted_By: userId,
        },
    })
};

module.exports = {
  logAdDeletion
}