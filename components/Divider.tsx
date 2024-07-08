// Divider.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const Divider = ({ width = '100%', height = 1, color = '#000', marginVertical = 10 }) => {
  return (
    <View style={[styles.divider, { width, height, backgroundColor: color, marginVertical }]} />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    marginVertical: 10,
  },
});

export default Divider;
