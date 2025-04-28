class BaseEvent {
    constructor(eventName, payload) {
      this.eventName = eventName;
      this.payload = payload; 
      this.timestamp = new Date();
    }
  }
  
  module.exports = BaseEvent;
  