const DB_KEY = 'meetpilot_db';

const initialSchema = {
  users: [],
  meetingTypes: [],
  availability: {}, // userId -> availability object
  bookings: [],
  notifications: [],
  emailLogs: [], 
};

class MockDatabaseService {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(DB_KEY);
    if (!existing) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialSchema));
    }
  }

  getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialSchema;
  }

  saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  getAll(collection) {
    const db = this.getDB();
    return db[collection] || [];
  }

  getById(collection, id) {
    const db = this.getDB();
    return db[collection]?.find(item => item.id === id);
  }

  create(collection, item) {
    const db = this.getDB();
    const newItem = { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: new Date().toISOString() 
    };
    db[collection] = [...(db[collection] || []), newItem];
    
    if (collection === 'users') {
      db.availability = db.availability || {};
      db.availability[newItem.id] = {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '17:00' },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        breaks: [],
        overrides: {},
      };
      
      const defaultMeeting = {
        id: Math.random().toString(36).substr(2, 9),
        userId: newItem.id,
        title: 'Introductory Call',
        duration: 30,
        description: 'A quick discovery call to discuss potential collaboration.',
        location: 'Google Meet',
        slug: 'intro-call',
        bufferBefore: 10,
        bufferAfter: 10,
        minNotice: 4,
        dailyLimit: 5,
        createdAt: new Date().toISOString()
      };
      db.meetingTypes.push(defaultMeeting);
    }
    
    this.saveDB(db);
    return newItem;
  }

  update(collection, id, updates) {
    const db = this.getDB();
    db[collection] = (db[collection] || []).map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    this.saveDB(db);
    return (db[collection] || []).find(item => item.id === id);
  }

  delete(collection, id) {
    const db = this.getDB();
    db[collection] = (db[collection] || []).filter(item => item.id !== id);
    this.saveDB(db);
  }

  getUserByEmail(email) {
    const db = this.getDB();
    return db.users.find(u => u.email === email);
  }

  updateProfile(userId, updates) {
    return this.update('users', userId, updates);
  }

  getAvailability(userId) {
    const db = this.getDB();
    return db.availability[userId] || {
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '17:00' },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      breaks: [],
      overrides: {},
    };
  }

  updateAvailability(userId, availability) {
    const db = this.getDB();
    db.availability[userId] = availability;
    this.saveDB(db);
    return availability;
  }

  logEmail(emailData) {
    return this.create('emailLogs', {
      ...emailData,
      sentAt: new Date().toISOString(),
      status: 'sent'
    });
  }

  getBookingsByUserId(userId) {
    const db = this.getDB();
    return db.bookings.filter(b => b.hostId === userId);
  }

  getUpcomingBookings(userId) {
    const db = this.getDB();
    const now = new Date();
    return db.bookings.filter(b => b.hostId === userId && new Date(b.startTime) > now && b.status !== 'cancelled');
  }
}

export const mockDB = new MockDatabaseService();
export default mockDB;
