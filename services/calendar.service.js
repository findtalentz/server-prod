import { CalendarRepository } from "../repositories/calendar.repository.js";
import { validateCalendar } from "../models/Calendar.js";
import APIError from "../utils/APIError.js";

export const CalendarService = {
  // Create a new calendar event
  createCalendar: async (calendarData) => {
    // Validate input data
    const { error, value } = validateCalendar(calendarData);
    if (error) {
      throw new APIError(
        400,
        `Validation failed: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    // Check if datetime is in the future when combined
    const combinedDateTime = new Date(value.date);
    const [hours, minutes] = value.time.split(":").map(Number);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    if (combinedDateTime < new Date()) {
      throw new APIError(400, "Combined date and time cannot be in the past");
    }

    return await CalendarRepository.create(value);
  },

  // Get calendar by ID
  getCalendarById: async (id) => {
    const calendar = await CalendarRepository.findById(id);
    if (!calendar) {
      throw new APIError(400, "Calendar not found");
    }
    return calendar;
  },

  // Get all calendars with filtering
  getAllCalendars: async (options = {}) => {
    return await CalendarRepository.findAll({}, options);
  },

  // Get user's calendars
  getUserCalendars: async (userId, options = {}) => {
    return await CalendarRepository.findByUser(userId, options);
  },

  // Update calendar
  updateCalendar: async (id, updateData, userId) => {
    // Check if calendar exists and user is owner
    const isOwner = await CalendarRepository.isOwner(id, userId);
    if (!isOwner) {
      throw new APIError(
        400,
        "Unauthorized: You can only update your own calendars"
      );
    }

    // Validate update data if provided
    if (Object.keys(updateData).length > 0) {
      const { error } = validateCalendar(updateData, { allowUnknown: true });
      if (error) {
        throw new APIError(
          400,
          `Validation failed: ${error.details.map((d) => d.message).join(", ")}`
        );
      }
    }

    const updatedCalendar = await CalendarRepository.update(id, updateData);
    if (!updatedCalendar) {
      throw new APIError(400, "Calendar not found");
    }

    return updatedCalendar;
  },

  // Delete calendar
  deleteCalendar: async (id) => {
    const deletedCalendar = await CalendarRepository.delete(id);
    if (!deletedCalendar) {
      throw new APIError(400, "Calendar not found");
    }

    return deletedCalendar;
  },

  // Get upcoming events
  getUpcomingEvents: async (userId, days = 7) => {
    return await CalendarRepository.findUpcoming(userId, days);
  },

  // Search calendars
  searchCalendars: async (searchTerm, options = {}) => {
    return await CalendarRepository.findAll(
      {},
      { ...options, search: searchTerm }
    );
  },

  // Get calendars by date range
  getCalendarsByDateRange: async (startDate, endDate, options = {}) => {
    return await CalendarRepository.findAll(
      {},
      { ...options, startDate, endDate }
    );
  },

  // Get calendar statistics
  getCalendarStats: async (userId) => {
    const stats = await Calendar.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          upcoming: {
            $sum: {
              $cond: [{ $gte: ["$date", new Date()] }, 1, 0],
            },
          },
        },
      },
    ]);

    const total = await Calendar.countDocuments({ createdBy: userId });
    const completed = await Calendar.countDocuments({
      createdBy: userId,
      status: "Completed",
    });

    return {
      byType: stats,
      total,
      completed,
      pending: total - completed,
    };
  },
};
