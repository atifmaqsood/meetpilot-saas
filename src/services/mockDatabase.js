/**
 * Mock Database Service
 * Simulates a backend using localStorage with atomic operations.
 */

const DB_KEY = 'meetpilot_db';

const initialSchema = {
  users: [],
  meetingTypes: [],
  availability: {}, // userId -> availability object
  bookings: [],
  notifications: [],
};

class MockDatabaseService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEY)) {
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

  // Generic CRUD
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
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    db[collection] = [...(db[collection] || []), newItem];
    
    // Seed default data for new users
    if (collection === 'users') {
      db.availability[newItem.id] = {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '17:00' },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        breaks: [],
      };
      
      const defaultMeeting = {
        id: Math.random().toString(36).substr(2, 9),
        userId: newItem.id,
        title: '15 Minute Meeting',
        duration: 15,
        description: 'Quick introductory call.',
        location: 'Google Meet',
        slug: '15-min',
        createdAt: new Date().toISOString()
      };
      db.meetingTypes.push(defaultMeeting);
    }
    
    this.saveDB(db);
    return newItem;
  }

  update(collection, id, updates) {
    const db = this.getDB();
    db[collection] = db[collection].map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    this.saveDB(db);
    return db[collection].find(item => item.id === id);
  }

  delete(collection, id) {
    const db = this.getDB();
    db[collection] = db[collection].filter(item => item.id !== id);
    this.saveDB(db);
  }

  // Auth Specific
  getUserByEmail(email) {
    const db = this.getDB();
    return db.users.find(u => u.email === email);
  }

  // Availability Specific
  getAvailability(userId) {
    const db = this.getDB();
    return db.availability[userId] || {
      workingDays: [1, 2, 3, 4, 5], // Mon-Fri
      workingHours: { start: '09:00', end: '17:00' },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      breaks: [],
    };
  }

  updateAvailability(userId, availability) {
    const db = this.getDB();
    db.availability[userId] = availability;
    this.saveDB(db);
    return availability;
  }

  // Filtered Bookings
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
