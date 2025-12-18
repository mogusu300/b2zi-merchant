export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  colors?: string[]
  types?: string[]
  sellerId: string
  sellerName: string
  sellerCompany?: string
  sellerAvatar?: string
  inStock: boolean
  rating?: number
  reviews?: number
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string
  selectedType?: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  trackingNumber?: string
  estimatedDelivery?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface Customer {
  id: string
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
}
