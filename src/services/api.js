import mockDB from './mockDatabase';

export const bookingService = {
  async fetchAll(userId) {
    return mockDB.getBookingsByUserId(userId);
  },

  async create(bookingData) {
    const booking = mockDB.create('bookings', { 
      ...bookingData, 
      status: 'confirmed' 
    });
    
    // Simulate Email
    mockDB.logEmail({
      userId: bookingData.hostId,
      to: bookingData.email,
      subject: 'Booking Confirmed!',
      body: `Hi ${bookingData.name}, your meeting is scheduled for ${new Date(bookingData.startTime).toLocaleString()}.`
    });

    return booking;
  },

  async updateStatus(id, status) {
    const booking = mockDB.update('bookings', id, { status });
    
    // Simulate Notification
    mockDB.create('notifications', {
      userId: booking.hostId,
      message: `Booking status updated to ${status} for ${booking.name}`,
    });

    return booking;
  },

  async cancel(id, reason = '') {
    const booking = mockDB.update('bookings', id, { status: 'cancelled', cancellationReason: reason });
    
    mockDB.logEmail({
      userId: booking.hostId,
      to: booking.email,
      subject: 'Meeting Cancelled',
      body: `Hi ${booking.name}, your meeting has been cancelled.`
    });

    return booking;
  }
};

export const meetingService = {
  async fetchAll(userId) {
    return mockDB.getAll('meetingTypes').filter(m => m.userId === userId);
  },

  async create(data) {
    return mockDB.create('meetingTypes', data);
  },

  async update(id, updates) {
    return mockDB.update('meetingTypes', id, updates);
  },

  async delete(id) {
    return mockDB.delete('meetingTypes', id);
  }
};

export const availabilityService = {
  async fetch(userId) {
    return mockDB.getAvailability(userId);
  },

  async save(userId, data) {
    return mockDB.updateAvailability(userId, data);
  }
};

export const analyticsService = {
  async getStats(userId) {
    const bookings = mockDB.getBookingsByUserId(userId);
    const now = new Date();
    
    return {
      total: bookings.length,
      upcoming: bookings.filter(b => b.status === 'confirmed' && new Date(b.startTime) > now).length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      weekly: bookings.filter(b => {
        const date = new Date(b.createdAt);
        const diff = (now - date) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }).length
    };
  }
};
