/**
 * Road to Glory — Domain Model
 * These entities mirror a future Supabase / Postgres schema 1:1.
 * The repository layer (lib/repository.ts) is the only place that touches data,
 * so swapping mock arrays for real Supabase queries is a localized change.
 */

export type Archetype =
  | "Entrepreneur"
  | "Investor"
  | "Athlete"
  | "Artist"
  | "Top Executive"
  | "Philanthropist"
  | "Creator"
  | "Operator"
  | "Visionary"
  | "Strategist"
  | "Public Figure"
  | "Scientist";

export type MembershipTier =
  | "Candidate"
  | "Selected"
  | "Member"
  | "Inner Circle"
  | "Founding Member"
  | "Sovereign";

export type LevelOfGreatness =
  | "Contender"
  | "Gladiator"
  | "Vanguard"
  | "Visionary"
  | "Titan"
  | "Sovereign";

export type GoalCategory =
  | "Business"
  | "Wealth"
  | "Health"
  | "Relationships"
  | "Mindset"
  | "Legacy"
  | "Impact"
  | "Personal Mastery";

export type Visibility = "private" | "allies" | "club";

export type CircleType = "Ally" | "Power Ring" | "Mastermind";

export type Rarity = "Standard" | "Rare" | "Elite" | "Mythic";

export interface User {
  id: string;
  fullName: string;
  username: string;
  profileImage: string; // gradient seed or url
  archetype: Archetype;
  bio: string;
  city: string;
  country: string;
  gloryScore: number;
  levelOfGreatness: LevelOfGreatness;
  membershipTier: MembershipTier;
  verified: boolean;
  inviteCode: string;
  onboardingCompleted: boolean;
  focusAreas: GoalCategory[];
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  description: string;
  currentLevel: number;
  targetLevel: number;
  progress: number; // 0-100
  visibility: Visibility;
  deadline?: string;
  nextAction: string;
  actionSteps: ActionStep[];
  createdAt: string;
}

export interface ActionStep {
  id: string;
  label: string;
  done: boolean;
}

export type MilestoneType =
  | "milestone"
  | "accomplishment"
  | "event"
  | "challenge"
  | "rank"
  | "goal"
  | "lesson";

export interface Milestone {
  id: string;
  goalId?: string;
  userId: string;
  title: string;
  description: string;
  achievedAt: string;
  verified: boolean;
  type: MilestoneType;
  category?: GoalCategory;
  reactions: { trophy: number; respect: number; salute: number; powerMove: number };
}

export interface LegacyEntry {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  reflection: string;
  symbol: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "connected" | "suggested";
  circleType: CircleType;
  createdAt: string;
}

export type AccessTier = "Member" | "Inner Circle" | "Founding" | "Sovereign";

export interface RtgEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string; // gradient key
  location: string;
  city: string;
  startAt: string;
  endAt: string;
  accessTier: AccessTier;
  hostId: string;
  rsvpCount: number;
  capacity: number;
  dressCode?: string;
}

export interface EventRSVP {
  id: string;
  userId: string;
  eventId: string;
  status: "going" | "waitlist" | "declined";
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  progressMetric: string;
  progress: number; // 0-100
  duration: string;
  rewardType: string;
  participants: number;
}

export interface MembershipApplication {
  id: string;
  userId: string;
  referralSource: string;
  applicationStatus: "submitted" | "in_review" | "peer_review" | "approved" | "waitlist";
  reviewNotes: string;
  submittedAt: string;
  stages: { label: string; done: boolean; active: boolean }[];
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  icon: string;
  rarity: Rarity;
  description: string;
  unlocked: boolean;
}
