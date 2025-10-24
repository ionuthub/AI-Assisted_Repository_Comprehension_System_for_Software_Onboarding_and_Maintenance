import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Usage tracking and cost management
export interface UsageStats {
  lineExplanations: number;
  fileExplanations: number;
  repositoriesAnalyzed: number;
  projectsGenerated: number;
  estimatedCost: number;
  lastReset: Date;
}

export interface UsageLimits {
  maxLineExplanations: number;
  maxFileExplanations: number;
  maxRepositoriesPerDay: number;
  maxProjectsPerDay: number;
  maxDailyCost: number;
  warningThreshold: number; // percentage (e.g., 80)
}

const DEFAULT_LIMITS: UsageLimits = {
  maxLineExplanations: 1000, // ~$0.75/month
  maxFileExplanations: 100,  // ~$0.075/month
  maxRepositoriesPerDay: 10,
  maxProjectsPerDay: 50,
  maxDailyCost: 5.00, // $5 per day
  warningThreshold: 80,
};

const COSTS = {
  lineExplanation: 0.00075,
  fileExplanation: 0.00075,
};

// Local storage key
const STORAGE_KEY = 'unravel_usage_stats';
const LIMITS_KEY = 'unravel_usage_limits';

export const getStorageKey = (userId?: string): string => {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
};

export const initializeUsageStats = (userId?: string): UsageStats => {
  return {
    lineExplanations: 0,
    fileExplanations: 0,
    repositoriesAnalyzed: 0,
    projectsGenerated: 0,
    estimatedCost: 0,
    lastReset: new Date(),
  };
};

export const getUsageStats = (userId?: string): UsageStats => {
  const key = getStorageKey(userId);
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    const stats = initializeUsageStats(userId);
    localStorage.setItem(key, JSON.stringify(stats));
    return stats;
  }
  
  return JSON.parse(stored);
};

export const updateUsageStats = (
  type: 'lineExplanation' | 'fileExplanation' | 'repositoryAnalyzed' | 'projectGenerated',
  userId?: string
): UsageStats => {
  const stats = getUsageStats(userId);
  const key = getStorageKey(userId);
  
  switch (type) {
    case 'lineExplanation':
      stats.lineExplanations += 1;
      stats.estimatedCost += COSTS.lineExplanation;
      break;
    case 'fileExplanation':
      stats.fileExplanations += 1;
      stats.estimatedCost += COSTS.fileExplanation;
      break;
    case 'repositoryAnalyzed':
      stats.repositoriesAnalyzed += 1;
      break;
    case 'projectGenerated':
      stats.projectsGenerated += 1;
      break;
  }
  
  localStorage.setItem(key, JSON.stringify(stats));
  return stats;
};

export const getLimits = (userId?: string): UsageLimits => {
  const key = `${LIMITS_KEY}_${userId || 'default'}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : DEFAULT_LIMITS;
};

export const setLimits = (limits: UsageLimits, userId?: string): void => {
  const key = `${LIMITS_KEY}_${userId || 'default'}`;
  localStorage.setItem(key, JSON.stringify(limits));
};

export interface UsageCheck {
  allowed: boolean;
  reason?: string;
  stats: UsageStats;
  limits: UsageLimits;
  percentageUsed: number;
  warningLevel: 'safe' | 'warning' | 'exceeded';
}

export const checkUsageLimit = (
  type: 'lineExplanation' | 'fileExplanation' | 'repositoryAnalyzed' | 'projectGenerated',
  userId?: string
): UsageCheck => {
  const stats = getUsageStats(userId);
  const limits = getLimits(userId);
  
  let currentUsage = 0;
  let maxLimit = 0;
  
  switch (type) {
    case 'lineExplanation':
      currentUsage = stats.lineExplanations;
      maxLimit = limits.maxLineExplanations;
      break;
    case 'fileExplanation':
      currentUsage = stats.fileExplanations;
      maxLimit = limits.maxFileExplanations;
      break;
    case 'repositoryAnalyzed':
      currentUsage = stats.repositoriesAnalyzed;
      maxLimit = limits.maxRepositoriesPerDay;
      break;
    case 'projectGenerated':
      currentUsage = stats.projectsGenerated;
      maxLimit = limits.maxProjectsPerDay;
      break;
  }
  
  const percentageUsed = (currentUsage / maxLimit) * 100;
  const costExceeded = stats.estimatedCost > limits.maxDailyCost;
  
  let allowed = currentUsage < maxLimit && !costExceeded;
  let reason: string | undefined;
  let warningLevel: 'safe' | 'warning' | 'exceeded' = 'safe';
  
  if (costExceeded) {
    allowed = false;
    reason = `Daily cost limit of $${limits.maxDailyCost.toFixed(2)} exceeded. Current: $${stats.estimatedCost.toFixed(2)}`;
    warningLevel = 'exceeded';
  } else if (currentUsage >= maxLimit) {
    allowed = false;
    reason = `${type} limit of ${maxLimit} reached`;
    warningLevel = 'exceeded';
  } else if (percentageUsed >= limits.warningThreshold) {
    warningLevel = 'warning';
  }
  
  return {
    allowed,
    reason,
    stats,
    limits,
    percentageUsed,
    warningLevel,
  };
};

export const resetDailyStats = (userId?: string): UsageStats => {
  const key = getStorageKey(userId);
  const stats = initializeUsageStats(userId);
  localStorage.setItem(key, JSON.stringify(stats));
  return stats;
};

export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

export const formatUsagePercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
