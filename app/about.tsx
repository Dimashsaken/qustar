import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors } from '../constants/Colors';

/**
 * About page with navigation header and concise app info (in Russian)
 * @returns JSX.Element
 */
const AboutPage: React.FC = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
        </Pressable>
        <ThemedText type="title" accessibilityRole="header" style={styles.headerTitle}>
          О приложении
        </ThemedText>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.contentWrapper}>
        <ThemedText type="default" style={styles.aboutText}>
          Qustar — это современное приложение для определения птиц Казахстана. Поддерживает быстрый поиск, фильтры по цвету, размеру и местообитанию. Работает онлайн, подходит для орнитологов, студентов и любителей природы. Все данные берутся из данных книги "Определитель птиц Казахстана" и BirdNet с разрешением на использование.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default AboutPage;

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
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  aboutText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.light.text,
  },
}); 