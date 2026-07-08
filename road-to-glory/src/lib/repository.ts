import {
  currentUser,
  members,
  goals,
  feed,
  legacyEntries,
  connections,
  events,
  challenges,
  membershipApplication,
  achievements,
} from "./mock-data";
import type { User } from "./types";

/**
 * Repository — the single seam between UI and data.
 *
 * Today it returns in-memory mock data synchronously wrapped in Promises.
 * Swapping to Supabase means replacing the bodies here with `supabase.from(...)`
 * queries; no screen or component changes required. Every method is async on
 * purpose so the call sites are already written for a real backend.
 */

const usersById = new Map<string, User>([currentUser, ...members].map((u) => [u.id, u]));

export const repository = {
  getCurrentUser: async () => currentUser,

  getUser: async (id: string) => usersById.get(id) ?? null,

  getMembers: async () => members,

  getGoals: async (userId: string = currentUser.id) =>
    goals.filter((g) => g.userId === userId),

  getGoal: async (id: string) => goals.find((g) => g.id === id) ?? null,

  getFeed: async () =>
    [...feed].sort((a, b) => +new Date(b.achievedAt) - +new Date(a.achievedAt)),

  getLegacyEntries: async (userId: string = currentUser.id) =>
    legacyEntries.filter((l) => l.userId === userId),

  getConnections: async () => connections,

  getEvents: async () =>
    [...events].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)),

  getEvent: async (id: string) => events.find((e) => e.id === id) ?? null,

  getChallenges: async () => challenges,

  getMembershipApplication: async () => membershipApplication,

  getAchievements: async () => achievements,
};

export type Repository = typeof repository;
