import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, PanResponder } from 'react-native';
import { BracketMatch, DoublEliminationBracket } from '@/types/bracket';
import MatchBox from './MatchBox';
import BracketConnector from './BracketConnector';
import Colors from '@/constants/colors';

interface DoubleEliminationBracketViewProps {
  bracket: DoublEliminationBracket;
  onMatchPress?: (match: BracketMatch) => void;
}

const MATCH_BOX_WIDTH = 200;
const MATCH_BOX_HEIGHT = 140;
const ROUND_SPACING = 80;
const MATCH_VERTICAL_SPACING = 40;

export default function DoubleEliminationBracketView({
  bracket,
  onMatchPress,
}: DoubleEliminationBracketViewProps) {
  const [contentWidth, setContentWidth] = useState<number>(0);
  const screenWidth = Dimensions.get('window').width;
  
  const scale = useRef(new Animated.Value(1)).current;
  const [currentScale, setCurrentScale] = useState<number>(1);
  const lastScale = useRef<number>(1);
  const baseDistance = useRef<number>(0);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          baseDistance.current = Math.sqrt(dx * dx + dy * dy);
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (baseDistance.current > 0) {
            const newScale = (distance / baseDistance.current) * lastScale.current;
            const clampedScale = Math.max(0.5, Math.min(3, newScale));
            scale.setValue(clampedScale);
            setCurrentScale(clampedScale);
          }
        }
      },
      onPanResponderRelease: () => {
        lastScale.current = currentScale;
      },
    })
  ).current;

  const renderRound = (matches: BracketMatch[], roundIndex: number, totalRounds: number) => {
    const spacingMultiplier = Math.pow(2, roundIndex);
    const baseSpacing = MATCH_VERTICAL_SPACING;
    const verticalSpacing = baseSpacing * spacingMultiplier;

    return (
      <View key={`round-${roundIndex}`} style={styles.roundColumn}>
        <Text style={styles.roundLabel}>Round {roundIndex + 1}</Text>
        <View style={styles.matchesContainer}>
          {matches.map((match, matchIndex) => (
            <View
              key={match.id}
              style={[
                styles.matchWrapper,
                {
                  marginTop: matchIndex === 0 ? 0 : verticalSpacing,
                },
              ]}
            >
              {roundIndex < totalRounds - 1 && (
                <View style={styles.connectorWrapper}>
                  <BracketConnector
                    type="horizontal"
                    width={ROUND_SPACING}
                  />
                </View>
              )}
              <MatchBox
                match={match}
                onPress={onMatchPress}
                width={MATCH_BOX_WIDTH}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderWinnersBracket = () => {
    return (
      <View style={styles.bracketSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Winners Bracket</Text>
        </View>
        <View style={styles.roundsContainer}>
          {bracket.winnersRounds.map((round, index) =>
            renderRound(round.matches, index, bracket.winnersRounds.length)
          )}
        </View>
      </View>
    );
  };

  const renderLosersBracket = () => {
    return (
      <View style={styles.bracketSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Losers Bracket</Text>
        </View>
        <View style={styles.roundsContainer}>
          {bracket.losersRounds.map((round, index) =>
            renderRound(round.matches, index, bracket.losersRounds.length)
          )}
        </View>
      </View>
    );
  };

  const renderFinals = () => {
    const grandFinal = bracket.finalsRounds.find(r => r.round === 1)?.matches[0];
    const resetMatch = bracket.finalsRounds.find(r => r.round === 2)?.matches[0];

    const showResetMatch = resetMatch && (resetMatch.team1 || resetMatch.team2 || resetMatch.status !== 'pending');

    return (
      <View style={styles.bracketSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Finals</Text>
        </View>
        <View style={styles.finalsContainer}>
          {grandFinal && (
            <View style={styles.finalMatchWrapper}>
              <Text style={styles.finalMatchLabel}>Grand Final (Match 18)</Text>
              <MatchBox
                match={grandFinal}
                onPress={onMatchPress}
                width={MATCH_BOX_WIDTH}
              />
            </View>
          )}
          {showResetMatch && (
            <View style={[styles.finalMatchWrapper, { marginTop: 24 }]}>
              <Text style={styles.finalMatchLabel}>Match 19 (Reset Match)</Text>
              <MatchBox
                match={resetMatch}
                onPress={onMatchPress}
                width={MATCH_BOX_WIDTH}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    const calculateWidth = () => {
      const winnersWidth = bracket.winnersRounds.length * (MATCH_BOX_WIDTH + ROUND_SPACING);
      const losersWidth = bracket.losersRounds.length * (MATCH_BOX_WIDTH + ROUND_SPACING);
      const finalsWidth = MATCH_BOX_WIDTH + 40;
      return Math.max(winnersWidth, losersWidth) + finalsWidth + 80;
    };
    
    const width = calculateWidth();
    setContentWidth(width);
  }, [bracket]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { width: Math.max(contentWidth * currentScale, screenWidth) },
        ]}
        testID="bracket-scroll-view"
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          style={styles.verticalScroll}
          testID="bracket-vertical-scroll"
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            {renderWinnersBracket()}
            <View style={styles.sectionSeparator} />
            {renderLosersBracket()}
            <View style={styles.sectionSeparator} />
            {renderFinals()}
            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bracketSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roundsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roundColumn: {
    marginRight: ROUND_SPACING,
  },
  roundLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchesContainer: {
    flexDirection: 'column',
  },
  matchWrapper: {
    position: 'relative',
  },
  connectorWrapper: {
    position: 'absolute',
    right: -ROUND_SPACING,
    top: MATCH_BOX_HEIGHT / 2,
    zIndex: -1,
  },
  finalsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  finalMatchWrapper: {
    alignItems: 'center',
  },
  finalMatchLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionSeparator: {
    height: 2,
    backgroundColor: Colors.light.border,
    marginVertical: 32,
  },
});
