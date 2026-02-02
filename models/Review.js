import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    servicesRating: {
      type: Number,
      required: [true, "Services rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    communicationRating: {
      type: Number,
      required: [true, "Communication rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    recommendationRating: {
      type: Number,
      required: [true, "Recommendation rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    descriptionRating: {
      type: Number,
      required: [true, "Description rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters long"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Prevent duplicate reviews
ReviewSchema.index({ job: 1, user: 1 }, { unique: true });

// Virtual for average rating (1-5 scale)
ReviewSchema.virtual("averageRating").get(function () {
  const ratings = [
    this.servicesRating,
    this.communicationRating,
    this.recommendationRating,
    this.descriptionRating,
  ];

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Math.round((total / ratings.length) * 10) / 10; // Returns 1.0 to 5.0
});

// Instance method
ReviewSchema.methods.getAverageRating = function () {
  return this.averageRating;
};

export const Review = mongoose.model("Review", ReviewSchema);
