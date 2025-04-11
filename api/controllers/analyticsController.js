const { batches, users } = require("../models/index");
const { tools } = require("./indexController");
const moment = require("moment-timezone");

const analyticsInit = async (req, res, next) => {
  try {
    const totalBatchesCount = await batches.countDocuments();

    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    const lastDayBatchesCount = await batches.countDocuments({
      createdAt: { $gte: lastDay },
    });

    const errorBatchesCount = await batches.countDocuments({
      status: 2,
    });
    const errorRate = totalBatchesCount
      ? ((errorBatchesCount / totalBatchesCount) * 100).toFixed(2)
      : 0;

    const mostUsedTool = await batches.aggregate([
      { $group: { _id: "$tool", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const MostUsedToolName = tools.find(toolObject => toolObject.subname === mostUsedTool[0]._id)?.name || "-";

    const topUser = await users.findOne().sort({ requestbatches: -1 });
    const topUserBatches = topUser.requestbatches;

    const topFiveUsers = await users
      .find({}, { firstname: 1, lastname: 1, requestbatches: 1, image: 1, department: 1 })
      .sort({ requestbatches: -1 })
      .limit(5);

    const topFiveUsersFormatted = topFiveUsers.map(user => ({
      name: `${user.firstname} ${user.lastname}`,
      requestBatches: user.requestbatches,
      department: user.department,
      img: user.image || "default.jpg",
    }));

    const totalItems = await batches.aggregate([
      { $group: { _id: null, total: { $sum: "$totalitems" } } },
    ]);

    const newUsers = await users
      .find({}, { firstname: 1, lastname: 1, image: 1, createdAt: 1, department: 1 })
      .sort({ createdAt: -1 })
      .limit(5);

    const newUsersFormatted = newUsers.map(user => {
      const joinedAgo = moment(user.createdAt).fromNow();
      return {
        name: `${user.firstname} ${user.lastname}`,
        joinedAgo,
        department: user.department,
        img: user.image || "default.jpg",
      };
    });

    const toolBatchCounts = await batches.aggregate([
      { $group: { _id: "$tool", totalBatches: { $sum: 1 } } },
    ]);

    const toolBatchCountsWithNames = toolBatchCounts.map(toolBatch => {
      const toolDetails = tools.find(tool => tool.subname === toolBatch._id);
      return {
        tool: toolDetails ? toolDetails.name : toolBatch._id,
        subname: toolBatch._id,
        totalBatches: toolBatch.totalBatches,
        divided: toolBatch.totalBatches/2,
      };
    });

    res.status(200).json({
      totalBatches: totalBatchesCount,
      errorRate: errorRate,
      lastDayBatches: lastDayBatchesCount,
      mostUsedTool: MostUsedToolName || "-",
      mostUsedToolCount: mostUsedTool[0]?.count || "-",
      topUser: topUser ? `${topUser.firstname} ${topUser.lastname}` : "-",
      topUserBatches: topUserBatches,
      topUserImg: topUser.image || "default.jpg",
      topFiveUsers: topFiveUsersFormatted,
      totalItems: totalItems[0]?.total || 0,
      recentlyAddedUser: newUsersFormatted,
      toolmetrics: toolBatchCountsWithNames, 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyticsInit };
