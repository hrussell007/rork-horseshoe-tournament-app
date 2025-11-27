# Double-Elimination Bracket System

## Overview

A complete visual double-elimination bracket system for tournaments with 10+ teams.

## Features

- ✅ Automatic bracket generation for 10+ teams
- ✅ Visual UI with match boxes, connectors, and rounds
- ✅ Winners and Losers brackets
- ✅ Grand Finals and Reset Match (If-Loss)
- ✅ Real-time score entry
- ✅ Automatic winner/loser advancement
- ✅ Horizontal and vertical scrolling
- ✅ Mobile-optimized layout
- ✅ Touch-friendly match selection

## Components

### 1. BracketManager
Main component that handles bracket state and coordination.

### 2. DoubleEliminationBracketView
Renders the complete visual bracket with all rounds.

### 3. MatchBox
Individual match display with teams, scores, and status.

### 4. ScoreEntryModal
Modal for entering match scores.

### 5. BracketConnector
Visual lines connecting matches.

## Usage Example

### Basic Usage

```tsx
import BracketManager from '@/components/BracketManager';
import { Team } from '@/types/tournament';

// Prepare your teams
const teams: Team[] = [
  { id: '1', player1Id: 'p1', player2Id: 'p2', name: 'Team 1' },
  { id: '2', player1Id: 'p3', player2Id: 'p4', name: 'Team 2' },
  // ... at least 10 teams
];

// Create a player map for display names
const playersMap = new Map([
  ['p1', { name: 'John Doe' }],
  ['p2', { name: 'Jane Smith' }],
  // ...
]);

// Render the bracket
<BracketManager teams={teams} playersMap={playersMap} />
```

### In a Tournament Screen

```tsx
import { useLocalSearchParams } from 'expo-router';
import { useTournamentData } from '@/contexts/TournamentContext';
import BracketManager from '@/components/BracketManager';

export default function TournamentBracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, players } = useTournamentData();
  
  const tournament = tournaments.find(t => t.id === id);
  
  const playersMap = React.useMemo(() => {
    const map = new Map();
    players.forEach(p => map.set(p.id, { name: p.name }));
    return map;
  }, [players]);
  
  if (!tournament || tournament.teams.length < 10) {
    return <Text>Need at least 10 teams</Text>;
  }
  
  return (
    <BracketManager 
      teams={tournament.teams} 
      playersMap={playersMap} 
    />
  );
}
```

### Standalone Usage (Without Context)

```tsx
import { useState } from 'react';
import { generateDoubleEliminationBracket, advanceWinner } from '@/utils/bracketGenerator';
import DoubleEliminationBracketView from '@/components/DoubleEliminationBracketView';
import ScoreEntryModal from '@/components/ScoreEntryModal';
import { BracketTeam, BracketMatch } from '@/types/bracket';

export default function CustomBracket() {
  const [bracket, setBracket] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Generate bracket
  React.useEffect(() => {
    const teams: BracketTeam[] = [
      { id: '1', name: 'Team A', seed: 1 },
      { id: '2', name: 'Team B', seed: 2 },
      // ... at least 10 teams
    ];
    
    const bracket = generateDoubleEliminationBracket(teams);
    setBracket(bracket);
  }, []);
  
  const handleMatchPress = (match: BracketMatch) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };
  
  const handleScoreSubmit = (
    matchId: string,
    team1Score: number,
    team2Score: number,
    winnerId: string
  ) => {
    const match = bracket.allMatches.find(m => m.id === matchId);
    const loserId = match.team1?.id === winnerId 
      ? match.team2?.id 
      : match.team1?.id;
    
    const updated = advanceWinner(
      bracket,
      matchId,
      winnerId,
      loserId,
      team1Score,
      team2Score
    );
    
    setBracket(updated);
  };
  
  if (!bracket) return null;
  
  return (
    <>
      <DoubleEliminationBracketView
        bracket={bracket}
        onMatchPress={handleMatchPress}
      />
      <ScoreEntryModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => setModalVisible(false)}
        onSubmit={handleScoreSubmit}
      />
    </>
  );
}
```

## Team Input Format

```typescript
interface Team {
  id: string;           // Unique team ID
  player1Id: string;    // First player ID
  player2Id: string;    // Second player ID
  name?: string;        // Optional team name
}

// Example
const teams: Team[] = [
  { id: 't1', player1Id: 'p1', player2Id: 'p2', name: 'Aces' },
  { id: 't2', player1Id: 'p3', player2Id: 'p4', name: 'Kings' },
  { id: 't3', player1Id: 'p5', player2Id: 'p6', name: 'Queens' },
  { id: 't4', player1Id: 'p7', player2Id: 'p8', name: 'Jacks' },
  { id: 't5', player1Id: 'p9', player2Id: 'p10', name: 'Tens' },
  { id: 't6', player1Id: 'p11', player2Id: 'p12', name: 'Nines' },
  { id: 't7', player1Id: 'p13', player2Id: 'p14', name: 'Eights' },
  { id: 't8', player1Id: 'p15', player2Id: 'p16', name: 'Sevens' },
  { id: 't9', player1Id: 'p17', player2Id: 'p18', name: 'Sixes' },
  { id: 't10', player1Id: 'p19', player2Id: 'p20', name: 'Fives' },
];
```

## Bracket Structure

### For 10 Teams:
- Winners Bracket: 4 rounds
- Losers Bracket: 6 rounds
- Finals: Grand Final + Reset Match (if needed)
- Total Matches: ~17 matches

### For 16 Teams:
- Winners Bracket: 4 rounds
- Losers Bracket: 6 rounds
- Finals: Grand Final + Reset Match (if needed)
- Total Matches: 30 matches

## Match States

- **pending**: Match not yet started (no teams or waiting)
- **in_progress**: Match is being played (not used automatically)
- **completed**: Match finished with winner

## How Advancement Works

1. Winner of a Winners Bracket match advances to next Winners round
2. Loser of a Winners Bracket match drops to Losers Bracket
3. Winner of a Losers Bracket match advances to next Losers round
4. Loser of a Losers Bracket match is eliminated
5. Winners Bracket champion goes to Grand Final (Team 1)
6. Losers Bracket champion goes to Grand Final (Team 2)
7. If Losers champion wins Grand Final, Reset Match is triggered
8. Winner of Reset Match wins the tournament

## Navigation Integration

To add bracket access from tournament screen:

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

<TouchableOpacity 
  onPress={() => router.push(`/bracket/${tournamentId}`)}
>
  <Text>View Bracket</Text>
</TouchableOpacity>
```

## Customization

### Match Box Size
Edit `MATCH_BOX_WIDTH` and `MATCH_BOX_HEIGHT` in `DoubleEliminationBracketView.tsx`

### Colors
Edit styles in individual components or update `Colors` in `constants/colors.ts`

### Spacing
Edit `ROUND_SPACING` and `MATCH_VERTICAL_SPACING` in `DoubleEliminationBracketView.tsx`

## API Reference

### generateDoubleEliminationBracket()
```typescript
function generateDoubleEliminationBracket(
  teams: BracketTeam[]
): DoublEliminationBracket
```

### advanceWinner()
```typescript
function advanceWinner(
  bracket: DoublEliminationBracket,
  matchId: string,
  winnerId: string,
  loserId: string,
  team1Score: number,
  team2Score: number
): DoublEliminationBracket
```

## Files Created

- `types/bracket.ts` - TypeScript types
- `utils/bracketGenerator.ts` - Bracket generation logic
- `components/MatchBox.tsx` - Match display component
- `components/BracketConnector.tsx` - Visual connectors
- `components/DoubleEliminationBracketView.tsx` - Main bracket view
- `components/ScoreEntryModal.tsx` - Score input modal
- `components/BracketManager.tsx` - Integration component
- `app/bracket/[id].tsx` - Example route

## Notes

- Requires minimum 10 teams
- Automatically handles byes for non-power-of-2 team counts
- Bracket state is managed locally (not persisted to storage by default)
- All scoring must result in a winner (no ties)
- Reset match only appears if Losers champion wins Grand Final
