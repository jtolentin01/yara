const { parseUserData } = require("./utils/restapis-utils");
const { reports } = require("./../models/index");
const {newticketId} = require("./utils/misc-utils");

const fsr = async (req, res, next) => {
    const user = parseUserData(req);
    const { fsrType, message } = req.body;
    try {
        const ticketId = newticketId();
        await reports.create({
            ticket: ticketId,
            type: fsrType,
            data: message,
            createby: `${user.firstname} ${user.lastname}`,
            updatedby: `${user.firstname} ${user.lastname}`,
        });

        res.status(200).json({ success: true, ticketId });
    } catch (error) {
        next(error);
    }
}

module.exports = { fsr };