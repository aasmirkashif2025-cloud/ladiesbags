import { 
  Product, 
  Collection, 
  Order, 
  Review, 
  DiscountCoupon, 
  BrandSettings, 
  HeroSlide, 
  UserAccount, 
  Currency 
} from '../types';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | undefined>;
  getById(id: string): Promise<Product | undefined>;
  getBySilhouette(silhouette: string): Promise<Product[]>;
  getByCollection(collectionId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Product | undefined>;
}

export interface ICollectionRepository {
  getAll(): Promise<Collection[]>;
  getBySlug(slug: string): Promise<Collection | undefined>;
  save(collection: Collection): Promise<Collection>;
}

export interface IOrderRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | undefined>;
  getByCustomerEmail(email: string): Promise<Order[]>;
  create(orderData: any): Promise<Order>;
  updateFulfillment(orderId: string, status: Order['fulfillmentStatus'], note: string, trackingNumber?: string): Promise<Order | undefined>;
  updatePayment(orderId: string, status: Order['paymentStatus'], note: string): Promise<Order | undefined>;
}

export interface IReviewRepository {
  getByProduct(productId: string): Promise<Review[]>;
  getAll(): Promise<Review[]>;
  add(review: Omit<Review, 'id' | 'date' | 'status'>): Promise<Review>;
  updateStatus(id: string, status: Review['status']): Promise<void>;
}

export interface ICouponRepository {
  getAll(): Promise<DiscountCoupon[]>;
  validate(code: string, subtotalPKR: number): Promise<{ valid: boolean; coupon?: DiscountCoupon; discountPKR: number; error?: string }>;
  save(coupon: DiscountCoupon): Promise<void>;
}

export interface IBrandRepository {
  getSettings(): Promise<BrandSettings>;
  updateSettings(settings: Partial<BrandSettings>): Promise<BrandSettings>;
  getHeroSlides(): Promise<HeroSlide[]>;
  updateHeroSlides(slides: HeroSlide[]): Promise<void>;
}
