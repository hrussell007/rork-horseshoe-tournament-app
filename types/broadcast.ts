export type BroadcastAudience = 
  | 'all_players'
  | 'checked_in'
  | 'next_round'
  | 'specific_court'
  | 'specific_players'
  | 'emergency';

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  audienceDetails?: {
    courtNumber?: number;
    playerIds?: string[];
    roundNumber?: number;
  };
  senderName: string;
  senderId: string;
  sentAt: string;
  tournamentId?: string;
  imageUri?: string;
  isEmergency: boolean;
  recipientCount: number;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  isCustom: boolean;
}

export const DEFAULT_TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'template-1',
    name: 'Tournament Starting',
    title: '🏆 Tournament Starting',
    message: 'Tournament starting in 10 minutes. Please check your court assignments.',
    audience: 'all_players',
    isCustom: false,
  },
  {
    id: 'template-2',
    name: 'Finals Starting',
    title: '🏆 Finals Starting',
    message: 'Championship finals starting now! All players please gather.',
    audience: 'all_players',
    isCustom: false,
  },
  {
    id: 'template-3',
    name: 'Court Available',
    title: '✅ Court Available',
    message: 'Court {court} is now open and ready for play.',
    audience: 'specific_court',
    isCustom: false,
  },
  {
    id: 'template-4',
    name: 'Match Ready',
    title: '🎯 Match Ready',
    message: 'Your match is ready. Please report to court {court}.',
    audience: 'specific_players',
    isCustom: false,
  },
  {
    id: 'template-5',
    name: 'Delay Notice',
    title: '⏰ Schedule Update',
    message: 'There will be a brief delay. We will update you shortly.',
    audience: 'all_players',
    isCustom: false,
  },
  {
    id: 'template-6',
    name: 'Break Time',
    title: '☕ Break Time',
    message: '15 minute break. Next round starts at {time}.',
    audience: 'all_players',
    isCustom: false,
  },
];
