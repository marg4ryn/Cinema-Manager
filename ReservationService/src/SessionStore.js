let sessions = [];

module.exports = {
  setSessions(newSessions) {
    sessions = newSessions;
  },
  getSessions() {
    return sessions;
  }
};
