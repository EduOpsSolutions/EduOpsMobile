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
  },
  decorativeTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: '#de0000',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: 80,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: '#de0000',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    zIndex: 2,
  },
  calendarContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  monthYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthButton: {
    backgroundColor: '#ffcf00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monthText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  yearButton: {
    backgroundColor: '#ffcf00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  activeViewMode: {
    backgroundColor: '#de0000',
  },
  viewModeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeViewModeText: {
    color: 'white',
  },
  calendarGrid: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
  },
  dayLabelCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarWeek: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayCell: {
    flex: 1,
    minHeight: 80,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  dayHeader: {
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  todayHeader: {
    backgroundColor: '#de0000',
  },
  otherMonthDay: {
    backgroundColor: '#f8f8f8',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  todayNumber: {
    color: 'white',
  },
  otherMonthNumber: {
    color: '#ccc',
  },
  eventsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    gap: 2,
    justifyContent: 'flex-start',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  classEventDot: {
    backgroundColor: '#FFE082',
  },
  examEventDot: {
    backgroundColor: '#81C784',
  },
  breakEventDot: {
    backgroundColor: '#64B5F6',
  },
  activityEventDot: {
    backgroundColor: '#FFB74D',
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