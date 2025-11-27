import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface BracketConnectorProps {
  type: 'vertical' | 'horizontal' | 'elbow-top' | 'elbow-bottom' | 't-junction';
  height?: number;
  width?: number;
}

export default function BracketConnector({ type, height = 60, width = 40 }: BracketConnectorProps) {
  switch (type) {
    case 'vertical':
      return <View style={[styles.vertical, { height }]} />;
    
    case 'horizontal':
      return <View style={[styles.horizontal, { width }]} />;
    
    case 'elbow-top':
      return (
        <View style={{ width, height: height / 2 }}>
          <View style={[styles.vertical, { height: height / 2, alignSelf: 'flex-end' }]} />
          <View style={[styles.horizontal, { width, position: 'absolute', bottom: 0, left: 0 }]} />
        </View>
      );
    
    case 'elbow-bottom':
      return (
        <View style={{ width, height: height / 2 }}>
          <View style={[styles.horizontal, { width, position: 'absolute', top: 0, left: 0 }]} />
          <View style={[styles.vertical, { height: height / 2, alignSelf: 'flex-end' }]} />
        </View>
      );
    
    case 't-junction':
      return (
        <View style={{ width, height }}>
          <View style={[styles.vertical, { height, alignSelf: 'center' }]} />
          <View style={[styles.horizontal, { width, position: 'absolute', top: height / 2, left: 0 }]} />
        </View>
      );
    
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  vertical: {
    width: 2,
    backgroundColor: Colors.light.border,
  },
  horizontal: {
    height: 2,
    backgroundColor: Colors.light.border,
  },
});
