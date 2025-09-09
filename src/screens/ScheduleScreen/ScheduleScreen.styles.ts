import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#de0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 32,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fffdf2',
    position: 'relative',
    paddingBottom: 80, // Space for bottom nav
  },
  scrollContent: {
    zIndex: 2,
  },
  calendarContainer: {
    flex: 1,
    padding: 16, // Reduced padding
    paddingBottom: 0,
  },
  calendarCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16, // Reduced padding
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
    flexWrap: 'wrap',
    gap: 8, // Reduced gap
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  yearButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 4,
  },
  navButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    padding: 3,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 17,
  },
  activeViewMode: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeViewModeText: {
    color: '#495057',
    fontWeight: '600',
  },
  calendarGrid: {
    flex: 1, // Take up remaining space
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dayLabelCell: {
    flex: 1,
    paddingVertical: 10, // Slightly reduced padding
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 11, // Slightly increased from 10
    fontWeight: '700', // Increased weight
    color: '#34495e', // Darker color
    textTransform: 'uppercase',
    letterSpacing: 0.8, // Slightly more letter spacing
  },
  calendarRow: {
    flex: 1, // Make rows flexible
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: '#e9ecef',
  },
  dayHeader: {
    paddingVertical: 8, // Slightly more padding
    alignItems: 'center',
    borderBottomWidth: 1, // Slightly thicker border
    borderBottomColor: '#bdc3c7', // Slightly darker border
    backgroundColor: '#fff',
  },
  todayHeader: {
    backgroundColor: '#de0000',
    shadowColor: '#000', // Add shadow to today's header
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dayNumber: {
    fontSize: 13, // Slightly increased from 12
    fontWeight: '700', // Increased weight for better visibility
    color: '#2c3e50', // Darker color
  },
  todayNumber: {
    color: 'white',
    fontWeight: '800', // Even bolder for today
    fontSize: 13, // Match dayNumber
  },
  eventsContainer: {
    flex: 1,
    padding: 5, // Slightly increased padding
    gap: 3, // Increased gap between events
  },
  eventBlock: {
    borderRadius: 6, // Slightly larger for better visual separation
    padding: 5, // Slightly increased padding
    marginBottom: 2, // Better spacing between events
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    shadowColor: '#000', // Add subtle shadow for depth
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  classEvent: {
    backgroundColor: '#fff8dc', // Slightly more saturated yellow
    borderLeftColor: '#f39c12', // More vibrant orange
  },
  examEvent: {
    backgroundColor: '#e8f5e8', // Slightly more saturated green
    borderLeftColor: '#27ae60', // More vibrant green
  },
  breakEvent: {
    backgroundColor: '#e6f3ff', // Slightly more saturated blue
    borderLeftColor: '#3498db', // More vibrant blue
  },
  activityEvent: {
    backgroundColor: '#ffe6e6', // Slightly more saturated red
    borderLeftColor: '#e74c3c', // More vibrant red
  },
  eventTime: {
    fontSize: 9, // Slightly increased from 8
    fontWeight: '700', // Increased from 600 for better readability
    color: '#2c3e50', // Darker color for better contrast
    marginBottom: 2, // Slightly more spacing
  },
  eventTitle: {
    fontSize: 8, // Slightly increased from 7
    color: '#34495e', // Darker color for better contrast
    lineHeight: 11, // Increased from 9 for better readability
    fontWeight: '600', // Increased from 500
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavText: {
    color: '#de0000',
    fontWeight: '500',
  },
});