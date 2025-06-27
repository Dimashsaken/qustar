import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BirdImage } from '../../components/BirdImage';
import { useBird } from '../../hooks/useBirds';

/**
 * Bird detail screen showing comprehensive bird information
 * Currently a placeholder implementation for future development
 * @returns JSX.Element - Bird detail screen component
 */
export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bird, isLoading, error } = useBird(id || '');

  /**
   * Renders loading state
   * @returns JSX.Element - Loading indicator
   */
  const renderLoading = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading bird details...</Text>
      </View>
    </SafeAreaView>
  );

  /**
   * Renders error state
   * @returns JSX.Element - Error message
   */
  const renderError = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load bird details</Text>
        <Text style={styles.errorSubtext}>
          {error?.message || 'Please check your connection and try again'}
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  /**
   * Renders not found state
   * @returns JSX.Element - Not found message
   */
  const renderNotFound = () => (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Bird not found</Text>
        <Text style={styles.errorSubtext}>
          The requested bird could not be found in our database
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (!bird) {
    return renderNotFound();
  }

  const displayName = bird.common_name_en || bird.scientific_name || 'Unknown Bird';
  const kazakhName = bird.common_name_kz;
  const russianName = bird.common_name_ru;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
            <Text style={styles.headerBackText}>← Back</Text>
          </Pressable>
          
          <BirdImage 
            birdId={bird.id} 
            scientificName={bird.scientific_name}
            size={120} 
            style={styles.headerImage} 
          />
          
          <Text style={styles.title}>{displayName}</Text>
          
          {bird.scientific_name && (
            <Text style={styles.scientificName}>{bird.scientific_name}</Text>
          )}
        </View>
        
        <View style={styles.content}>
          {/* Multi-language names */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Names</Text>
            {kazakhName && (
              <View style={styles.nameRow}>
                <Text style={styles.nameLabel}>Kazakh:</Text>
                <Text style={styles.nameValue}>{kazakhName}</Text>
              </View>
            )}
            {russianName && (
              <View style={styles.nameRow}>
                <Text style={styles.nameLabel}>Russian:</Text>
                <Text style={styles.nameValue}>{russianName}</Text>
              </View>
            )}
          </View>
          
          {/* Basic information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classification</Text>
            {bird.family && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Family:</Text>
                <Text style={styles.infoValue}>{bird.family}</Text>
              </View>
            )}
            {bird.order && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order:</Text>
                <Text style={styles.infoValue}>{bird.order}</Text>
              </View>
            )}
          </View>
          
          {/* Physical characteristics */}
          {(bird.size || bird.length_cm_min || bird.wingspan_cm_min || bird.weight_g_min) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical Characteristics</Text>
              {bird.size && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Size:</Text>
                  <Text style={styles.infoValue}>{bird.size}</Text>
                </View>
              )}
              {(bird.length_cm_min || bird.length_cm_max) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Length:</Text>
                  <Text style={styles.infoValue}>
                    {bird.length_cm_min}-{bird.length_cm_max} cm
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              🚧 More detailed information coming soon...
            </Text>
            <Text style={styles.placeholderSubtext}>
              This screen will be enhanced with comprehensive bird data, habitat information, 
              conservation status, and high-quality images in future updates.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  headerBackButton: { alignSelf: 'flex-start', marginBottom: 16 },
  headerBackText: { fontSize: 16, color: '#0066cc' },
  headerImage: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  scientificName: { fontSize: 16, fontStyle: 'italic', color: '#6c757d', textAlign: 'center' },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  nameRow: { flexDirection: 'row', marginBottom: 8 },
  nameLabel: { fontWeight: '600', width: 80, color: '#495057' },
  nameValue: { flex: 1, color: '#212529' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontWeight: '600', width: 80, color: '#495057' },
  infoValue: { flex: 1, color: '#212529' },
  placeholder: { padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, alignItems: 'center' },
  placeholderText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  placeholderSubtext: { fontSize: 14, color: '#6c757d', textAlign: 'center', lineHeight: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6c757d' },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#dc3545', textAlign: 'center', marginBottom: 8 },
  errorSubtext: { fontSize: 14, color: '#6c757d', textAlign: 'center', marginBottom: 16 },
  backButton: { backgroundColor: '#0066cc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
}); 