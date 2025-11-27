# Live Public Scoreboard Feature

## Overview
The Live Public Scoreboard is a read-only display that allows players and spectators to follow tournament action in real-time. It automatically updates as scores are entered through Scorekeeper Mode or Director Mode.

## Features

### 1. **Live Bracket View**
- Fully visual, scrollable double-elimination bracket
- Automatically updates as scores are entered
- Shows match numbers, team names, and highlights winners
- Winners and losers brackets visually separated
- Supports pinch-to-zoom for better viewing

### 2. **Court Assignment Board**
- Real-time court status display
- Shows:
  - Currently playing matches with live LIVE indicator
  - Next match waiting
  - Last completed match
  - Court availability status
- Auto-refreshes when match changes

### 3. **Live Match Progress Feed**
- Timeline of completed matches
- Shows:
  - Winner and loser team names
  - Final scores
  - Time completed (e.g., "5m ago")
  - Court number
  - Round number
- Most recent matches first

### 4. **Live Leaderboard**
- Current standings for all teams
- Shows:
  - Rank (with gold/silver/bronze badges for top 3)
  - Team names
  - Wins and losses
  - Total points scored
- Top 3 teams highlighted

## Access Points

### Home Screen
- When there's an active tournament, a prominent "Live Scoreboard" card appears at the top
- Features a dark design with red "LIVE NOW" indicator
- Shows tournament name and description
- One-tap access to scoreboard

### Tournament Detail Page
- TV icon button in the header (only visible for active tournaments)
- Available to all users (not just admins)

## User Interface

### Header
- **LIVE** indicator with pulsing dot
- Tournament name and metadata (date, location, team count)
- Auto-refresh toggle (ON by default, refreshes every 5 seconds)

### Tab Navigation
4 main tabs:
1. **Bracket** - Visual bracket display (for double-elimination only)
2. **Courts** - Court assignment and status board
3. **Live Feed** - Timeline of completed matches
4. **Rankings** - Current team leaderboard

### Design Features
- Large, tournament-style fonts
- Clean, modern UI
- Pull-to-refresh on scrollable sections
- Responsive design that scales to phones, tablets, and TVs
- Empty states with helpful messages
- Smooth animations

## Technical Details

### Route
`/scoreboard?id={tournamentId}`

### Real-Time Updates
- Uses state listeners from TournamentContext
- Auto-refresh every 5 seconds (when enabled)
- Manual refresh via pull-to-refresh
- Updates immediately when scores change

### Tournament Format Support
- **Double Elimination (10+ teams)**: Shows full bracket view
- **Round Robin (4-8 teams)**: Shows court assignments and standings
- Displays appropriate empty states for tournaments without generated brackets

### Data Sources
- Tournament information from `TournamentContext`
- Match data filtered by tournament ID
- Player information for team name resolution
- Real-time bracket state updates

## User Experience

### For Spectators
- Read-only access (no edit capabilities)
- Easy-to-read display optimized for viewing from distance
- Live updates without manual refresh
- Quick glance at current tournament status

### For Players
- Check when their next match is scheduled
- See which court to report to
- View current standings
- Track tournament progress

### For Tournament Directors
- Can display on TV or projector for public viewing
- Reduces questions about "when's my next match?"
- Professional tournament atmosphere
- No risk of accidental data changes

## Performance
- Efficient data filtering and memoization
- Minimal re-renders with useMemo
- Smooth scrolling with optimized list rendering
- Small bundle size impact

## Future Enhancements (Potential)
- [ ] QR code generation for easy access
- [ ] Fullscreen mode for TV display
- [ ] Custom branding/themes per tournament
- [ ] Match notifications
- [ ] Bracket screenshot/export
- [ ] Statistics and analytics view
- [ ] Multiple tournament tracking
- [ ] Custom refresh intervals

## Files Created/Modified

### New Files
- `app/scoreboard.tsx` - Main scoreboard screen component

### Modified Files
- `app/(tabs)/home.tsx` - Added Live Scoreboard card for active tournaments
- `app/tournament/[id].tsx` - Added TV icon button to header

## Usage Example

```typescript
// Navigate to scoreboard
router.push(`/scoreboard?id=${tournamentId}`);

// Scoreboard automatically:
// 1. Loads tournament data
// 2. Filters matches by tournament
// 3. Displays appropriate views based on format
// 4. Auto-refreshes every 5 seconds
// 5. Updates when data changes
```

## Integration Notes
- Seamlessly integrates with existing tournament system
- Uses existing data structures (no schema changes)
- Compatible with both round-robin and double-elimination formats
- Works with existing Director Mode and Scorekeeper Mode
- No backend required (all client-side)
