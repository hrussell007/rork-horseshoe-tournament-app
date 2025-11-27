# Director Mode - Complete System Documentation

## Overview
Director Mode is a comprehensive tournament management system for the Horseshoe Series app that gives directors complete control over brackets, matches, players, and tournament state.

## Features

### 🔐 Security & Access
- **Admin Access**: Automatically available to users logged in with admin email
- **PIN Access**: 4-digit PIN (default: `1234`) for non-admin access
- **Hidden Gesture**: Tap the 🎬 icon in the bracket header 5 times within 2 seconds to open PIN prompt

### 🎯 Core Functionality

#### 1. Manual Match Editor (Matches Tab)
- **View All Matches**: See matches from Winners, Losers, and Finals brackets
- **Edit Scores**: Modify team scores for any match
- **Force Winners**: Override match results and force a specific team to win
- **Automatic Progression**: Changes automatically update bracket and advance teams

**Actions:**
- `Edit Score`: Modify scores for both teams
- `Save Score`: Apply changes and update bracket
- `Force T1 Wins`: Force Team 1 to win the match (30-0)
- `Force T2 Wins`: Force Team 2 to win the match (30-0)

#### 2. Player Management (Players Tab)
- **Edit Names**: Modify player names on the fly
- **View Team Info**: See partner assignments and seed numbers
- **Mark No-Shows**: Log players who don't show up (logged but doesn't auto-remove)
- **Class Display**: Shows player class (A or B)

**Actions:**
- `Edit Name`: Change player name
- `No-Show`: Mark player as no-show (logged for records)

#### 3. Bracket Position Editor (Bracket Tab)
- **View Team Status**: See which bracket each team is in (Winners/Losers/Eliminated)
- **Track Losses**: Visual display of team losses (0, 1, or 2+)
- **Active Matches**: See which matches each team is currently in
- **Reseed Bracket**: Rebuild bracket structure while preserving results

**Actions:**
- `Reseed Bracket`: Regenerates bracket with current team positions

#### 4. Reset Tools (Reset Tab)
⚠️ **WARNING**: These actions are destructive and cannot be undone!

**Available Actions:**
- **Clear All Scores**: Resets all match scores to 0-0 but keeps bracket structure
- **Reset Entire Bracket**: Completely resets bracket to initial state (removes all results)
- **Recalculate Standings**: Recalculates team standings based on current results

#### 5. Change Log (Logs Tab)
- **Audit Trail**: Every director action is logged with timestamp
- **Action Types**: Color-coded by severity (red=destructive, orange=edits, green=access)
- **Details**: Full details of what changed
- **Tournament Filter**: See logs for current tournament or all tournaments
- **Clear Logs**: Permanently delete all logs (requires confirmation)

**Log Examples:**
```
✅ Director Mode Accessed - Via admin login
🔄 Match Score Updated - Match 12: Team A 30 - 25 Team B
⚠️ Match Winner Forced - Match 5: Forced Team C to win
🗑️ Bracket Completely Reset - Reset bracket to initial state with 12 teams
```

## Access Methods

### Method 1: Admin Login
1. Log in with admin email (`hrussell007@gmail.com`)
2. Navigate to any bracket screen
3. Tap the 🎬 icon in the header
4. Director Mode opens immediately (no PIN required)

### Method 2: PIN Entry (Non-Admin)
1. Navigate to any bracket screen
2. Tap the 🎬 icon in the header 5 times quickly (within 2 seconds)
3. PIN prompt appears
4. Enter PIN: `1234`
5. Tap "Unlock"

### Method 3: Direct Access (From Code)
If you need to open Director Mode programmatically:
```typescript
setDirectorModeVisible(true);
```

## Technical Implementation

### File Structure
```
contexts/
  └── DirectorLogContext.tsx          # Change log management

components/
  ├── DirectorMode.tsx                # Main modal container with tabs
  └── DirectorMode/
      ├── MatchesTab.tsx              # Match editor
      ├── PlayersTab.tsx              # Player management
      ├── BracketTab.tsx              # Bracket editor
      ├── ResetTab.tsx                # Reset tools
      └── LogsTab.tsx                 # Change log viewer

app/
  ├── _layout.tsx                     # DirectorLogContext provider
  └── bracket/[id].tsx                # Integrated with hidden gesture
```

### State Management
- **Director Logs**: Stored in AsyncStorage (`horseshoe_director_logs`)
- **Bracket State**: Saved to tournament's `bracketState` property
- **Match Updates**: Saved to tournament matches collection

### Integration Points
Director Mode integrates with:
- `TournamentContext`: Tournament and match data
- `AuthContext`: Admin authentication
- `DirectorLogContext`: Change logging
- `BracketManager`: Bracket state updates
- `bracketGenerator`: Bracket manipulation utilities

## Usage Guidelines

### When to Use Each Tab

#### Matches Tab
- Correcting score entry errors
- Resolving disputed match results
- Fixing bracket progression issues
- Emergency match overrides

#### Players Tab
- Fixing typos in player names
- Logging no-shows for records
- Verifying team assignments

#### Bracket Tab
- Reviewing tournament structure
- Checking team bracket positions
- Reseeding after major changes

#### Reset Tab
- Starting tournament over
- Clearing test data
- Major bracket corrections
- Recalculating after manual edits

#### Logs Tab
- Audit trail review
- Tracking director actions
- Troubleshooting issues
- Accountability

### Best Practices

1. **Always Check Logs**: Review logs before making major changes
2. **Document Decisions**: Actions are auto-logged but keep external notes for context
3. **Test on Practice Tournament**: Test reset/reseed on practice tournament first
4. **Communicate Changes**: Notify players when forcing match results
5. **Backup Strategy**: Take screenshots before major resets
6. **PIN Security**: Change default PIN in production (`DIRECTOR_PIN` constant)

### Common Workflows

#### Fixing a Wrong Score
1. Open Director Mode
2. Go to Matches tab
3. Find the match
4. Tap "Edit Score"
5. Enter correct scores
6. Tap "Save Score"

#### Handling a No-Show
1. Open Director Mode
2. Go to Players tab
3. Find the player
4. Tap "No-Show"
5. Confirm action
6. Note: Team assignment remains (manual bracket fix needed)

#### Restarting a Tournament
1. Open Director Mode
2. Go to Reset tab
3. Read warnings carefully
4. Tap "Reset Entire Bracket"
5. Confirm action
6. Bracket returns to initial seeding

#### Forcing a Match Result (Emergency)
1. Open Director Mode
2. Go to Matches tab
3. Find the match
4. Tap "Force T1" or "Force T2"
5. Confirm action
6. Match is marked as won 30-0

## Security Considerations

### Current Security
- PIN is hardcoded: `1234`
- Admin access via email check
- No role-based permissions
- Logs cannot be edited

### Recommended Production Changes
1. **Move PIN to Environment Variable**
   ```typescript
   const DIRECTOR_PIN = process.env.DIRECTOR_PIN || '1234';
   ```

2. **Add PIN Change Feature**
   - Store encrypted PIN in AsyncStorage
   - Add admin setting to change PIN

3. **Add Additional Roles**
   - Super Admin (full access)
   - Director (no reset tools)
   - Scorekeeper (matches only)

4. **Add Log Encryption**
   - Encrypt logs at rest
   - Add log integrity checks

## Troubleshooting

### Director Mode Won't Open
- **Check**: Are you on a bracket screen?
- **Check**: Does tournament have 10+ teams?
- **Solution**: Ensure you're tapping the 🎬 icon, not the screen

### PIN Not Working
- **Check**: Is PIN exactly `1234`?
- **Check**: Is keyboard set to numeric?
- **Solution**: Close and reopen PIN prompt

### Changes Not Saving
- **Check**: Are errors showing in console?
- **Check**: Is bracket state valid?
- **Solution**: Check Logs tab for error messages

### Bracket Looks Wrong After Reset
- **Reason**: Team count changed or data corrupted
- **Solution**: Go to Reset tab → "Reset Entire Bracket"

### Logs Not Showing
- **Check**: Are you filtering by current tournament?
- **Check**: Were logs cleared?
- **Solution**: Look at "All System Actions" section

## API Reference

### DirectorLogContext
```typescript
const { logs, addLog, clearLogs } = useDirectorLog();

// Add a log entry
addLog(
  action: string,
  details: string,
  tournamentId?: string,
  matchId?: string,
  playerId?: string
);

// Clear all logs
clearLogs();
```

### DirectorMode Component
```typescript
<DirectorMode
  visible={boolean}
  onClose={() => void}
  tournamentId={string}
  bracket={DoublEliminationBracket | null}
  onBracketUpdate={(bracket) => void}
/>
```

## Future Enhancements

### Potential Features
- [ ] Drag-and-drop team reseeding
- [ ] Undo/redo functionality
- [ ] Export logs to CSV
- [ ] Live tournament preview
- [ ] Match scheduling tools
- [ ] Bulk score entry
- [ ] Custom bracket templates
- [ ] Multi-director mode (conflict resolution)
- [ ] Offline mode with sync
- [ ] Advanced analytics

## Support

For issues or questions:
1. Check this documentation
2. Review change logs for clues
3. Test on practice tournament
4. Contact app administrator

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-27  
**Author**: Rork AI Builder  
**License**: Proprietary
