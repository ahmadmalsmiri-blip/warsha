
import { User, UserRole, ServiceRequest, Bid, RequestStatus, Review, ChatMessage, AppNotification } from '../types';

/**
 * Real Firebase logic would be implemented here. 
 * For this implementation, we use localStorage to provide a full persistence 
 * experience within the browser environment.
 */

const STORAGE_KEYS = {
  USERS: 'wp_users',
  REQUESTS: 'wp_requests',
  BIDS: 'wp_bids',
  REVIEWS: 'wp_reviews',
  MESSAGES: 'wp_messages',
  NOTIFICATIONS: 'wp_notifications'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  users: {
    getAll: () => getFromStorage<User[]>(STORAGE_KEYS.USERS, []),
    getById: (id: string) => db.users.getAll().find(u => u.id === id),
    save: (user: User) => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === user.id);
      if (index > -1) users[index] = user;
      else users.push(user);
      saveToStorage(STORAGE_KEYS.USERS, users);
    },
    getByEmail: (email: string) => db.users.getAll().find(u => u.email === email)
  },
  requests: {
    getAll: () => getFromStorage<ServiceRequest[]>(STORAGE_KEYS.REQUESTS, []),
    save: (req: ServiceRequest) => {
      const reqs = db.requests.getAll();
      const index = reqs.findIndex(r => r.id === req.id);
      if (index > -1) reqs[index] = req;
      else reqs.push(req);
      saveToStorage(STORAGE_KEYS.REQUESTS, reqs);
    },
    getById: (id: string) => db.requests.getAll().find(r => r.id === id)
  },
  bids: {
    getAll: () => getFromStorage<Bid[]>(STORAGE_KEYS.BIDS, []),
    save: (bid: Bid) => {
      const bids = db.bids.getAll();
      const index = bids.findIndex(b => b.id === bid.id);
      if (index > -1) bids[index] = bid;
      else bids.push(bid);
      saveToStorage(STORAGE_KEYS.BIDS, bids);
    },
    getByRequest: (requestId: string) => db.bids.getAll().filter(b => b.requestId === requestId),
    getById: (id: string) => db.bids.getAll().find(b => b.id === id)
  },
  reviews: {
    getAll: () => getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, []),
    save: (review: Review) => {
      const reviews = db.reviews.getAll();
      reviews.push(review);
      saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
      
      // Update technician rating
      const technician = db.users.getById(review.technicianId);
      if (technician) {
        const techReviews = reviews.filter(r => r.technicianId === review.technicianId);
        const avg = techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length;
        technician.rating = avg;
        technician.reviewCount = techReviews.length;
        db.users.save(technician);
      }
    }
  },
  messages: {
    getAll: () => getFromStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []),
    getByRequest: (requestId: string) => db.messages.getAll().filter(m => m.requestId === requestId),
    send: (message: ChatMessage) => {
      const msgs = db.messages.getAll();
      msgs.push(message);
      saveToStorage(STORAGE_KEYS.MESSAGES, msgs);
    }
  },
  notifications: {
    getAll: () => getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []),
    getByUser: (userId: string) => db.notifications.getAll().filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
    add: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const all = db.notifications.getAll();
      const newN: AppNotification = {
        ...n,
        id: `ntf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        read: false
      };
      all.push(newN);
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    },
    markAsRead: (id: string) => {
      const all = db.notifications.getAll();
      const index = all.findIndex(n => n.id === id);
      if (index > -1) {
        all[index].read = true;
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
      }
    },
    markAllRead: (userId: string) => {
      const all = db.notifications.getAll();
      all.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }
};

// Seed initial Demo Data if empty
const currentUsers = db.users.getAll();
if (currentUsers.length === 0) {
  // Admin
  db.users.save({
    id: 'admin-1',
    name: 'المدير العام',
    email: 'admin@warsha.com',
    phone: '0790000000',
    role: UserRole.ADMIN,
    approved: true
  });

  // Approved Tech
  db.users.save({
    id: 'tech-1',
    name: 'أحمد الكهربائي',
    email: 'tech@demo.com',
    phone: '0781234567',
    role: UserRole.TECHNICIAN,
    approved: true,
    rating: 4.8,
    reviewCount: 12,
    bio: 'خبير صيانة كهربائية منذ 10 سنوات. متخصص في صيانة اللوحات الرئيسية وتمديدات المنازل الذكية.',
    portfolio: [
      'https://images.unsplash.com/photo-1621905252507-b35242f8969d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1558444458-5cd0554d89bc?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=400&q=80'
    ]
  });

  // Pending Tech
  db.users.save({
    id: 'tech-2',
    name: 'عمر السباك',
    email: 'new-tech@demo.com',
    phone: '0779876543',
    role: UserRole.TECHNICIAN,
    approved: false,
    bio: 'فني تمديدات صحية بخبرة واسعة في عمان والزرقاء.',
    portfolio: []
  });

  // Customer
  db.users.save({
    id: 'cust-1',
    name: 'سارة خالد',
    email: 'customer@demo.com',
    phone: '0791112223',
    role: UserRole.CUSTOMER,
    approved: true
  });

  // Sample Request
  db.requests.save({
    id: 'req-demo-1',
    customerId: 'cust-1',
    customerName: 'سارة خالد',
    category: 'كهرباء',
    description: 'يوجد عطل في لوحة القواطع الرئيسية في المنزل، بعض الأضواء لا تعمل.',
    city: 'عمان',
    preferredTime: 'اليوم الساعة 6 مساءً',
    status: RequestStatus.OPEN,
    createdAt: Date.now() - 3600000 // 1 hour ago
  });

  // Sample Bid
  db.bids.save({
    id: 'bid-demo-1',
    requestId: 'req-demo-1',
    technicianId: 'tech-1',
    technicianName: 'أحمد الكهربائي',
    technicianRating: 4.8,
    price: 15,
    message: 'يمكنني الحضور وفحص اللوحة اليوم، السعر يشمل الفحص فقط.',
    createdAt: Date.now() - 1800000 // 30 mins ago
  });
}
