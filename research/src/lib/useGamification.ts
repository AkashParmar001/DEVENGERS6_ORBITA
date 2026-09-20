'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CareerProfile,
  INITIAL_BADGES,
  INITIAL_SKILLS,
  INITIAL_CHALLENGES,
  BadgeDefinition,
  getRankForXp,
} from './gamification';
import { sound } from './sound';

const STORAGE_KEY = 'orbita_career_profile_v1';

export interface ToastMessage {
  id: string;
  type: 'xp' | 'badge' | 'level' | 'info';
  title: string;
  description: string;
  icon?: string;
  xp?: number;
}

const DEFAULT_PROFILE: CareerProfile = {
  xp: 420,
  level: 2,
  rankTitle: 'Orbital Specialist',
  streakDays: 5,
  missionsCompleted: 8,
  simulationsRun: 34,
  conjunctionsMitigated: 12,
  experimentsBenchmarked: 6,
  unlockedBadges: ['badge-first-inspection', 'badge-fuel-conservation'],
  unlockedSkills: ['skill-astrodynamics', 'skill-rpo-guidance', 'skill-covariance-analysis'],
  challenges: INITIAL_CHALLENGES,
};

export function useGamification() {
  const [profile, setProfile] = useState<CareerProfile>(DEFAULT_PROFILE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      }
    } catch {
      // Ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  const saveProfile = useCallback((newProfile: CareerProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch {
      // Ignore
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Award XP with toast and audio
  const awardXP = useCallback(
    (amount: number, reason: string) => {
      sound.playConfirm();
      setProfile((prev) => {
        const newXp = prev.xp + amount;
        const prevRankInfo = getRankForXp(prev.xp);
        const nextRankInfo = getRankForXp(newXp);

        let newLevel = prev.level;
        let newTitle = prev.rankTitle;

        // Level Up check!
        if (nextRankInfo.currentRank.level > prevRankInfo.currentRank.level) {
          newLevel = nextRankInfo.currentRank.level;
          newTitle = nextRankInfo.currentRank.title;
          sound.playAchievement();
          addToast({
            type: 'level',
            title: 'OPERATOR PROMOTION!',
            description: `You have reached Level ${newLevel}: ${newTitle}`,
            icon: '⭐',
          });
        } else {
          addToast({
            type: 'xp',
            title: `+${amount} RESEARCH XP`,
            description: reason,
            icon: '⚡',
            xp: amount,
          });
        }

        const updated: CareerProfile = {
          ...prev,
          xp: newXp,
          level: newLevel,
          rankTitle: newTitle,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [addToast]
  );

  // Unlock Badge
  const unlockBadge = useCallback(
    (badgeId: string) => {
      const badge = INITIAL_BADGES.find((b) => b.id === badgeId);
      if (!badge) return;

      setProfile((prev) => {
        if (prev.unlockedBadges.includes(badgeId)) return prev;

        sound.playAchievement();
        addToast({
          type: 'badge',
          title: `ACHIEVEMENT UNLOCKED: ${badge.name}`,
          description: badge.description,
          icon: badge.icon,
        });

        const newBadges = [...prev.unlockedBadges, badgeId];
        const newXp = prev.xp + badge.xpReward;
        const updated: CareerProfile = {
          ...prev,
          unlockedBadges: newBadges,
          xp: newXp,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [addToast]
  );

  // Unlock Skill
  const unlockSkill = useCallback(
    (skillId: string, cost: number) => {
      if (profile.xp < cost) {
        sound.playWarning();
        addToast({
          type: 'info',
          title: 'INSUFFICIENT XP',
          description: `Required: ${cost} XP (Current: ${profile.xp} XP)`,
          icon: '⚠️',
        });
        return false;
      }

      setProfile((prev) => {
        if (prev.unlockedSkills.includes(skillId)) return prev;

        sound.playConfirm();
        addToast({
          type: 'badge',
          title: 'SKILL CAPABILITY ONLINE',
          description: 'Orbital system upgraded with new algorithm',
          icon: '🧠',
        });

        const newSkills = [...prev.unlockedSkills, skillId];
        const updated: CareerProfile = {
          ...prev,
          unlockedSkills: newSkills,
          xp: prev.xp - cost,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
      return true;
    },
    [profile.xp, addToast]
  );

  const rankInfo = getRankForXp(profile.xp);

  return {
    profile,
    rankInfo,
    toasts,
    dismissToast,
    awardXP,
    unlockBadge,
    unlockSkill,
    saveProfile,
    isLoaded,
  };
}
