import jobRepository from "../repositories/job.repository.js";
import reviewRepository from "../repositories/review.repository.js";
import userRepository from "../repositories/user.repository.js";
import APIError from "../utils/APIError.js";

const royaltyService = {
  royaltyStatusSeller: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new APIError(404, "User not found");

    const totalEarning = user.totalEarning || 0;

    const reviews = await reviewRepository.getReviewsBySellerId(userId);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, item) => sum + item.averageRating, 0) /
          reviewCount
        : 0;
    const completedJobCount = await jobRepository.completedJobCount(userId);

    const stepRequirements = [
      { jobs: 1, reviews: 1, minRating: 4.5, minEarning: 200 },
      { jobs: 5, reviews: 5, minRating: 4.5, minEarning: 400 },
      { jobs: 10, reviews: 10, minRating: 4.5, minEarning: 1000 },
      { jobs: 15, reviews: 15, minRating: 4.5, minEarning: 2500 },
      { jobs: 30, reviews: 30, minRating: 4.5, minEarning: 20000 },
    ];

    const stepCompletion = stepRequirements.map((requirement) => {
      const jobsCompleted = Math.min(completedJobCount, requirement.jobs);
      const reviewsCompleted = Math.min(reviewCount, requirement.reviews);
      const earningCompleted = Math.min(totalEarning, requirement.minEarning);

      const ratingMet = averageRating >= requirement.minRating;
      const jobPercentage = (jobsCompleted / requirement.jobs) * 100;
      const reviewPercentage = (reviewsCompleted / requirement.reviews) * 100;
      const earningPercentage =
        (earningCompleted / requirement.minEarning) * 100;

      let completionPercentage = Math.min(
        jobPercentage,
        reviewPercentage,
        earningPercentage
      );

      if (!ratingMet) {
        completionPercentage = Math.min(completionPercentage, 99);
      }

      return Number(completionPercentage.toFixed());
    });

    return {
      step1: stepCompletion[0],
      step2: stepCompletion[1],
      step3: stepCompletion[2],
      step4: stepCompletion[3],
      step5: stepCompletion[4],
    };
  },

  royaltyStatusClient: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new APIError(404, "User not found");

    const totalSpend = user.totalSpend || 0;
    const spendingThresholds = [200, 400, 1000, 2500, 20000];

    const stepCompletion = spendingThresholds.map((threshold) => {
      const percentage = (totalSpend / threshold) * 100;
      return Number(Math.min(100, percentage).toFixed());
    });

    return {
      step1: stepCompletion[0],
      step2: stepCompletion[1],
      step3: stepCompletion[2],
      step4: stepCompletion[3],
      step5: stepCompletion[4],
    };
  },
};

export default royaltyService;
