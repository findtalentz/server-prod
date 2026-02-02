import APIError from "../utils/APIError.js";
import { Calendar } from "../models/Calendar.js";

export const CalendarRepository = {
  // Create a new calendar event
  create: async (calendarData) => {
    try {
      const calendar = new Calendar(calendarData);
      return await calendar.save();
    } catch (error) {
      throw new APIError(400, `Failed to create calendar: ${error.message}`);
    }
  },

  // Find calendar by ID
  findById: async (id) => {
    try {
      return await Calendar.findById(id).populate("createdBy", "name email");
    } catch (error) {
      throw new APIError(400, `Failed to find calendar: ${error.message}`);
    }
  },

  // Find all calendars with filtering and pagination
  findAll: async (filter = {}, options = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "asc",
        search = "",
        startDate,
        endDate,
        type,
        status,
      } = options;

      // Build query
      let query = { ...filter };

      // Search in title and description
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Date range filter
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      // Type filter
      if (type) {
        query.type = type;
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const calendars = await Calendar.find(query)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Calendar.countDocuments(query);

      return {
        calendars,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new APIError(400, `Failed to fetch calendars: ${error.message}`);
    }
  },

  // Update calendar
  update: async (id, updateData) => {
    try {
      return await Calendar.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email");
    } catch (error) {
      throw new APIError(400, `Failed to update calendar: ${error.message}`);
    }
  },

  // Delete calendar
  delete: async (id) => {
    try {
      return await Calendar.findByIdAndDelete(id);
    } catch (error) {
      throw new APIError(400, `Failed to delete calendar: ${error.message}`);
    }
  },

  // Find calendars by user
  findByUser: async (userId, options = {}) => {
    try {
      return await CalendarRepository.findAll({ createdBy: userId }, options);
    } catch (error) {
      throw new APIError(
        400,
        `Failed to find user calendars: ${error.message}`
      );
    }
  },

  // Find upcoming events
  findUpcoming: async (userId, days = 7) => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return await Calendar.find({
        createdBy: userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .populate("createdBy", "name email")
        .sort({ date: 1, time: 1 })
        .lean();
    } catch (error) {
      throw new APIError(
        400,
        `Failed to find upcoming calendars: ${error.message}`
      );
    }
  },
};
