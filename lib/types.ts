export interface User {
  id: string;
  email: string;
  name: string;
  role: 'organizer' | 'volunteer' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizerId: string;
  organizerName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  eventId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: 'open' | 'full' | 'closed';
  duties: string[];
  createdAt: Date;
}

export interface Volunteer {
  id: string;
  userId: string;
  eventId: string;
  shiftId: string;
  status: 'assigned' | 'confirmed' | 'checked-in' | 'checked-out' | 'no-show';
  assignedAt: Date;
  confirmedAt?: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
  notes?: string;
}

export interface Attendance {
  id: string;
  volunteerId: string;
  shiftId: string;
  eventId: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'no-show';
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface Duty {
  id: string;
  name: string;
  description: string;
  eventId: string;
  shiftId: string;
  requiredSkills?: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface EventStats {
  totalVolunteers: number;
  confirmedVolunteers: number;
  checkedInVolunteers: number;
  noShows: number;
  totalShifts: number;
  completedShifts: number;
  upcomingShifts: number;
} 