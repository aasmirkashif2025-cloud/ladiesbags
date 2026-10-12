import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType, testConnection } from './firebase';
import { 
  Product, 
  Collection, 
  Order, 
  Review, 
  DiscountCoupon, 
  BrandSettings, 
  HeroSlide, 
  UserAccount 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_COLLECTIONS, 
  INITIAL_BRAND_SETTINGS, 
  INITIAL_HERO_SLIDES, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS, 
  INITIAL_ORDERS 
} from '../data/initialData';

const ADMIN_EMAILS = ['ksarwar78@gmail.com'];

// Helper to remove undefined fields recursively so Firestore setDoc does not throw invalid-argument
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export class FirebaseStore {
  private isConnected = false;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      this.isConnected = await testConnection();
    } catch {
      this.isConnected = false;
    }
  }

  isLiveConnected(): boolean {
    return this.isConnected;
  }

  // AUTHENTICATION
  async signInWithGoogle(): Promise<UserAccount> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '') || 
                      (fbUser.email?.endsWith('@maisonelan.com') ?? false);

      const userAccount: UserAccount = {
        id: fbUser.uid,
        email: fbUser.email || '',
        fullName: fbUser.displayName || 'Distinguished Guest',
        role: isAdmin ? 'admin' : 'customer',
        savedAddresses: [],
        createdAt: new Date().toISOString(),
      };

      // Persist user record in Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), userAccount, { merge: true });
      } catch (err) {
        console.warn('Could not save user profile to firestore:', err);
      }

      return userAccount;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await fbSignOut(auth);
  }

  subscribeAuth(callback: (user: UserAccount | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        callback(null);
        return;
      }

      const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '') || 
                      (fbUser.email?.endsWith('@maisonelan.com') ?? false);

      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserAccount;
          callback({
            ...data,
            role: isAdmin ? 'admin' : (data.role || 'customer'),
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to load user document from firestore:', err);
      }

      const fallbackUser: UserAccount = {
        id: fbUser.uid,
        email: fbUser.email || '',
        fullName: fbUser.displayName || 'Distinguished Guest',
        role: isAdmin ? 'admin' : 'customer',
        savedAddresses: [],
        createdAt: new Date().toISOString(),
      };
      callback(fallbackUser);
    });
  }

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snapshot = await getDocs(collection(db, path));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(d => d.data() as Product);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async saveProduct(product: Product): Promise<void> {
    const path = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), cleanFirestoreData(product));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const path = `products/${productId}`;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // COLLECTIONS
  async getCollections(): Promise<Collection[]> {
    const path = 'collections';
    try {
      const snapshot = await getDocs(collection(db, path));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(d => d.data() as Collection);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async saveCollection(col: Collection): Promise<void> {
    const path = `collections/${col.id}`;
    try {
      await setDoc(doc(db, 'collections', col.id), cleanFirestoreData(col));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const path = 'orders';
    try {
      const snapshot = await getDocs(collection(db, path));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(d => d.data() as Order);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async createOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), cleanFirestoreData(order));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  async updateOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), cleanFirestoreData(order), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // REVIEWS
  async getReviews(): Promise<Review[]> {
    const path = 'reviews';
    try {
      const snapshot = await getDocs(collection(db, path));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(d => d.data() as Review);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async addReview(review: Review): Promise<void> {
    const path = `reviews/${review.id}`;
    try {
      await setDoc(doc(db, 'reviews', review.id), review);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  async updateReviewStatus(reviewId: string, status: Review['status']): Promise<void> {
    const path = `reviews/${reviewId}`;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // COUPONS
  async getCoupons(): Promise<DiscountCoupon[]> {
    const path = 'coupons';
    try {
      const snapshot = await getDocs(collection(db, path));
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(d => d.data() as DiscountCoupon);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  async saveCoupon(coupon: DiscountCoupon): Promise<void> {
    const path = `coupons/${coupon.code}`;
    try {
      await setDoc(doc(db, 'coupons', coupon.code), cleanFirestoreData(coupon));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // SETTINGS & BRAND
  async getBrandSettings(): Promise<BrandSettings | null> {
    const path = 'settings/global';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      if (docSnap.exists()) {
        return docSnap.data() as BrandSettings;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  async saveBrandSettings(settings: BrandSettings): Promise<void> {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, 'settings', 'global'), cleanFirestoreData(settings), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // SEED INITIAL DATA TO FIRESTORE
  async seedInitialCatalog(): Promise<{ products: number; collections: number; coupons: number }> {
    let pCount = 0;
    let cCount = 0;
    let cpCount = 0;

    // Seed products
    for (const p of INITIAL_PRODUCTS) {
      try {
        await setDoc(doc(db, 'products', p.id), cleanFirestoreData(p));
        pCount++;
      } catch (err) {
        console.warn(`Failed seeding product ${p.id}:`, err);
      }
    }

    // Seed collections
    for (const c of INITIAL_COLLECTIONS) {
      try {
        await setDoc(doc(db, 'collections', c.id), cleanFirestoreData(c));
        cCount++;
      } catch (err) {
        console.warn(`Failed seeding collection ${c.id}:`, err);
      }
    }

    // Seed coupons
    for (const cp of INITIAL_COUPONS) {
      try {
        await setDoc(doc(db, 'coupons', cp.code), cleanFirestoreData(cp));
        cpCount++;
      } catch (err) {
        console.warn(`Failed seeding coupon ${cp.code}:`, err);
      }
    }

    // Seed brand settings
    try {
      await setDoc(doc(db, 'settings', 'global'), cleanFirestoreData(INITIAL_BRAND_SETTINGS));
    } catch (err) {
      console.warn('Failed seeding brand settings:', err);
    }

    return { products: pCount, collections: cCount, coupons: cpCount };
  }
}

export const firebaseStore = new FirebaseStore();
