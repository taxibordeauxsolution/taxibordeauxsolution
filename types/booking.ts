export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PriceDetails {
  basePrice: number;
  baseFare?: number;  // Alias pour basePrice
  approachFees: number;
  totalPrice: number;
  tariffType: string;
  priseEnCharge: number;
  tarifKm: number;
  isNight: boolean;
  isHoliday: boolean;
  isSunday: boolean;
  supplements?: number;
}

export interface RouteInfo {
  steps: any[];
  overview: string;
  bounds: any;
}

export interface TripData {
  from: string;
  to: string;
  fromCoords: Coordinates | null;
  toCoords: Coordinates | null;
  distance: number;
  duration: number;
  price: number;
  priceDetails: Partial<PriceDetails>;
  routeInfo: RouteInfo | null;
  serviceAreaValidation: { valid: boolean; reason?: string };
}

export interface BookingData {
  passengers: number;
  luggage: number;
  departureDate: string;
  departureTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  language: string;
}

export interface ReservationData {
  reservationId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  trip: {
    from: { address: string };
    to: { address: string };
    distance: number;
  };
  pricing: {
    totalPrice: number;
    priceDetails?: Partial<PriceDetails>;
  };
  bookingDetails: {
    passengers: number;
    luggage: number;
    notes: string;
  };
  estimatedPickupTime: string;
  next_steps: string[];
  emailSent?: boolean;
}