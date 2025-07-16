/**
 * CreditsScreen displays attributions for BirdNET, the Kazakhstan Field Guide, and developer info.
 * Designed for use in the Settings section. Strict TypeScript, ≤120 LoC, documented, and themed.
 */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

/**
 * CreditsScreen component for displaying attributions and acknowledgements.
 * @returns Themed credits screen
 */
const CreditsScreen: React.FC = () => (
  <View style={styles.container}>
    
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.sectionTitle}>Определитель птичьих звуков</ThemedText>
      <ThemedText style={styles.text}>
        BirdNET - это программа для идентификации птичьих звуков от{"\n"}
        © 2025 Cornell University | Chemnitz University of Technology
      </ThemedText>
      <View style={styles.sectionSpacer} />
      <ThemedText style={styles.sectionTitle}>Информация и изображения птиц</ThemedText>
      <ThemedText style={styles.text}>
        Было взято с книги "Полевой определитель птиц Казахстана" с разрешением от авторов
      </ThemedText>
      <View style={styles.sectionSpacer} />
      <ThemedText style={styles.sectionTitle}>Звуки птиц</ThemedText>
      <ThemedText style={styles.text}>
        Звуковые записи птиц предоставлены сообществом Xeno Canto (xeno-canto.org){"\n"}
        © Xeno Canto Foundation - открытая коллекция звуков птиц со всего мира
      </ThemedText>
      <View style={styles.sectionSpacer} />
      <ThemedText style={styles.sectionTitle}>Разработчик</ThemedText>
      <ThemedText style={styles.text}>
        Разработчик: Динмухаммед Сакен, Казахстан
      </ThemedText>
    </ScrollView>
  </View>
);

export default CreditsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
  text: {
    color: '#222',
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 4,
    lineHeight: 22,
  },
  sectionSpacer: {
    height: 18,
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
}); 