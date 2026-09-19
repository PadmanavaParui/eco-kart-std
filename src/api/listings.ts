import { ApiError } from '../types';
import type { Listing } from '../types';
import { getAccessToken } from '../auth/cognito';

/**
 * Listings API (Phases 4+5) - the real persistence path.
 * Every write call carries the Cognito access token; the backend derives
 * ownerId from the verified JWT sub, never from the request body.
 */

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(new RegExp('/+$'), '');

const LOCAL_LISTINGS_KEY = 'smartsort.local_listings.v1';

function getLocalListings(): ListingRecord[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_LISTINGS_KEY) : null;
    return raw ? (JSON.parse(raw) as ListingRecord[]) : [];
  } catch {
    return [];
  }
}

function saveLocalListing(rec: ListingRecord): void {
  const current = getLocalListings();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify([rec, ...current]));
  }
}

export interface ListingRecord {
  listingId: string;
  ownerId: string;
  material: string;
  subtype: string;
  quantityTonnes: number;
  quality: string;
  pricePerKg: number;
  city: string;
  locality: string;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  pickupFrom: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingInput {
  material: string;
  subtype: string;
  quantityTonnes: number;
  quality: string;
  pricePerKg: number;
  city: string;
  locality: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  pickupFrom: string;
  description: string;
}

async function callListingsApi<T>(path: string, init: RequestInit = {}, authed = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authed) {
    const token = await getAccessToken();
    if (!token) throw new ApiError('Sign in to continue.', 'validation');
    headers.Authorization = 'Bearer ' + token;
  }
  let res: Response;
  try {
    res = await fetch(API_BASE + path, { ...init, headers, signal: AbortSignal.timeout(15000) });
  } catch {
    throw new ApiError('Network error - check your connection and try again.', 'network');
  }
  if (res.status === 404) return null as T;
  const body = (await res.json().catch(() => null)) as (T & { error?: string; message?: string }) | null;
  if (!res.ok) {
    throw new ApiError(body?.error ?? body?.message ?? (res.status === 401 ? 'Your session has expired - sign in again.' : 'The service is temporarily unavailable.'), res.status >= 500 ? 'server' : 'validation');
  }
  return body as T;
}

/** POST /listings - authenticated; server assigns the id and ownerId. */
export async function createListing(input: CreateListingInput): Promise<{ listingId: string; createdAt: string; status: string }> {
  if (!API_BASE) {
    const token = await getAccessToken();
    const id = 'lot_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const record: ListingRecord = {
      listingId: id,
      ownerId: token ? 'user_me' : 'demo_seller',
      material: input.material,
      subtype: input.subtype,
      quantityTonnes: input.quantityTonnes,
      quality: input.quality,
      pricePerKg: input.pricePerKg,
      city: input.city,
      locality: input.locality,
      pickupLatitude: input.pickupLatitude ?? null,
      pickupLongitude: input.pickupLongitude ?? null,
      pickupFrom: input.pickupFrom,
      description: input.description,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    saveLocalListing(record);
    return { listingId: id, createdAt: now, status: 'ACTIVE' };
  }
  return callListingsApi('/listings', { method: 'POST', body: JSON.stringify(input) }, true);
}

/** GET /listings/{id} - public read; null when the listing does not exist. */
export async function fetchListing(id: string): Promise<ListingRecord | null> {
  if (!API_BASE) {
    const local = getLocalListings().find((l) => l.listingId === id);
    return local ?? null;
  }
  return callListingsApi('/listings/' + encodeURIComponent(id));
}

/** GET /my-listings - owner-scoped; JWT required. */
export async function fetchMyListings(): Promise<{ listings: ListingRecord[] }> {
  if (!API_BASE) {
    return { listings: getLocalListings() };
  }
  return callListingsApi('/my-listings', {}, true);
}

/** Map a persisted record onto the Listing domain type used by the UI. */
export function recordToListing(r: ListingRecord): Listing {
  return {
    id: r.listingId,
    seller: 'EcoKart seller',
    sellerType: 'Business',
    material: r.material as Listing['material'],
    subtype: r.subtype,
    quantityTonnes: r.quantityTonnes,
    pricePerKg: r.pricePerKg,
    quality: r.quality as Listing['quality'],
    city: r.city,
    locality: r.locality,
    lat: r.pickupLatitude ?? Number.NaN,
    lng: r.pickupLongitude ?? Number.NaN,
    pickupFrom: r.pickupFrom,
    description: r.description || 'No description provided.',
    status: r.status as Listing['status'],
    listedAt: r.createdAt,
    views: 0,
    verified: false,
  };
}
