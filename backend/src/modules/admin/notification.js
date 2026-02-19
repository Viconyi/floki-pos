// Notification utility for backend
// Placeholder: Replace with actual Firebase/OneSignal logic and credentials
const sendNotification = async (to, title, message, data = {}) => {
  // TODO: Integrate with Firebase Cloud Messaging or OneSignal
  console.log(`Send notification to ${to}: ${title} - ${message}`);
  // Implement actual notification logic here
};

module.exports = { sendNotification };
