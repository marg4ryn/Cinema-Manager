class BaseEvent {
    constructor(eventName, payload) {
      if (!eventName || !payload) {
        throw new Error('eventName and payload are required');
      }
  
      this.eventName = eventName;
      this.payload = payload;
      this.timestamp = new Date().toISOString();
    }
  }
  
  module.exports = BaseEvent;
  