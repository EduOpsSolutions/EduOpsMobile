import axiosInstance from './axios';

interface EnrollmentPeriod {
  id: string;
  batchName: string;
  startAt: string;
  endAt: string;
  enrollmentOpenAt: string;
  enrollmentCloseAt: string;
  isEnrollmentClosed: boolean;
  deletedAt: string | null;
  status: string;
}

interface EnrollmentPeriodCheckResult {
  hasOngoingPeriod: boolean;
  currentPeriod: EnrollmentPeriod | null;
  error: string | null;
}

/**
 * Check if there are any ongoing enrollment periods
 * @returns {Promise<EnrollmentPeriodCheckResult>}
 */
export const checkOngoingEnrollmentPeriod = async (): Promise<EnrollmentPeriodCheckResult> => {
  try {
    const response = await axiosInstance.get('/academic-periods');
    const now = new Date();

    // Only consider periods where isEnrollmentClosed is false
    const ongoingPeriods = response.data.filter((period: EnrollmentPeriod) => {
      if (period.isEnrollmentClosed || period.deletedAt) return false;
      if (!period.enrollmentOpenAt || !period.enrollmentCloseAt) return false;
      const openDate = new Date(period.enrollmentOpenAt);
      const closeDate = new Date(period.enrollmentCloseAt);
      if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) return false;
      return now >= openDate && now <= closeDate;
    });

    const hasOngoingPeriod = ongoingPeriods.length > 0;
    const currentPeriod = hasOngoingPeriod ? ongoingPeriods[0] : null;

    return {
      hasOngoingPeriod,
      currentPeriod,
      error: null,
    };
  } catch (error) {
    console.error('Failed to fetch enrollment periods:', error);
    return {
      hasOngoingPeriod: false,
      currentPeriod: null,
      error: 'Failed to check enrollment availability',
    };
  }
};

/**
 * Format enrollment period date range for display
 * @param {EnrollmentPeriod} period - The enrollment period object
 * @returns {string} - Formatted date range
 */
export const formatEnrollmentPeriodDates = (period: EnrollmentPeriod | null): string => {
  if (!period) return '';

  const startDate = new Date(period.startAt);
  const endDate = new Date(period.endAt);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return `${startDate.toLocaleDateString(
    'en-US',
    options
  )} - ${endDate.toLocaleDateString('en-US', options)}`;
};
