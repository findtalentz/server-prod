import { CalendarService } from "../services/calendar.service.js";
import APIError from "../utils/APIError.js";
import Response from "../utils/Response.js";

export const CalendarController = {
  createCalendar: async (req, res, next) => {
    const calendarData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const calendar = await CalendarService.createCalendar(calendarData);

    const response = new Response(
      true,
      "Calendar created successfully",
      calendar
    );

    res.status(201).json(response);
  },

  // Get calendar by ID
  getCalendar: async (req, res, next) => {
    const calendar = await CalendarService.getCalendarById(req.params.id);

    const response = new Response(
      true,
      "Calendar retrieved successfully",
      calendar
    );

    res.status(200).json(response);
  },

  // Get all calendars (with filtering and pagination)
  getAllCalendars: async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "asc",
      search,
      startDate,
      endDate,
      type,
      status,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      startDate,
      endDate,
      type,
      status,
    };

    const result = await CalendarService.getAllCalendars(options);

    const response = new Response(
      true,
      "Calendars retrieved successfully",
      result.calendars,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit
    );

    res.status(200).json(response);
  },

  // Get user's calendars
  getUserCalendars: async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "asc",
      search,
      startDate,
      endDate,
      type,
      status,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      search,
      startDate,
      endDate,
      type,
      status,
    };

    const result = await CalendarService.getUserCalendars(
      req.user._id,
      options
    );

    const response = new Response(
      true,
      "User calendars retrieved successfully",
      result.calendars,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit
    );

    res.status(200).json(response);
  },

  // Update calendar
  updateCalendar: async (req, res, next) => {
    const updatedCalendar = await CalendarService.updateCalendar(
      req.params.id,
      req.body,
      req.user._id
    );

    const response = new Response(
      true,
      "Calendar updated successfully",
      updatedCalendar
    );

    res.status(200).json(response);
  },

  // Delete calendar
  deleteCalendar: async (req, res, next) => {
    const { id } = req.params;
    await CalendarService.deleteCalendar(id);
    const response = new Response(true, "Calendar deleted successfully");
    res.status(200).json(response);
  },

  // Get upcoming events
  getUpcomingEvents: async (req, res, next) => {
    const days = parseInt(req.query.days) || 7;
    const events = await CalendarService.getUpcomingEvents(req.user._id, days);

    const response = new Response(
      true,
      "Upcoming events retrieved successfully",
      events,
      events.length
    );

    res.status(200).json(response);
  },

  // Search calendars
  searchCalendars: async (req, res, next) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      throw new APIError(400, "Search query is required");
    }

    const result = await CalendarService.searchCalendars(q, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const response = new Response(
      true,
      "Search completed successfully",
      result.calendars,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit
    );

    res.status(200).json(response);
  },

  // Get calendar statistics
  getCalendarStats: async (req, res, next) => {
    const stats = await CalendarService.getCalendarStats(req.user._id);

    const response = new Response(
      true,
      "Calendar statistics retrieved successfully",
      stats
    );

    res.status(200).json(response);
  },
};
