/**
 * /credits screen for Expo Router, displays CreditsScreen with header and back navigation.
 */
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import CreditsScreen from '../components/CreditsScreen';
import { ThemedText } from '../components/ThemedText';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors } from '../constants/Colors';

/**
 * Credits page with navigation header
 * @returns JSX.Element
 */
const CreditsPage: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="title" accessibilityRole="header" style={styles.headerTitle}>
          Благодарности
        </ThemedText>
        <View style={styles.headerRight} />
      </View>
      <CreditsScreen />
    </SafeAreaView>
  );
};

export default CreditsPage;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  headerRight: {
    width: 32,
  },
}); 