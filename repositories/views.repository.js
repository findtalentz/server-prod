import { Views } from "../models/Views.js";
import mongoose from "mongoose";
const viewsRepository = {
  incrementViews: async (data) => {
    const { type, ip, subjectId } = data;
    await Views.create({ type, subjectId, ip });
  },

  getViewByTypeAndIp: async ({ ip, type, subjectId }) => {
    return await Views.findOne({ type, ip, subjectId });
  },

  getViewsByMonth: async ({ numberOfMonth, subjectId, viewsType }) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numberOfMonth);
    startDate.setDate(1); // Start from first day of the month
    startDate.setHours(0, 0, 0, 0);

    // First, get the actual view counts
    const viewsData = await Views.aggregate([
      {
        $match: {
          type: viewsType,
          subjectId: new mongoose.Types.ObjectId(subjectId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          views: { $sum: 1 },
        },
      },
    ]);

    // Create a map for easy lookup
    const viewsMap = new Map();
    viewsData.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      viewsMap.set(key, item.views);
    });

    // Generate all months in the range
    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const result = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
      const key = `${year}-${month}`;

      result.push({
        month: monthNames[month],
        views: viewsMap.get(key) || 0,
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return result;
  },
};

export default viewsRepository;
