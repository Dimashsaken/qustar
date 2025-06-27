import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BirdImage } from '../../components/BirdImage';
import { useBird } from '../../hooks/useBirds';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = screenHeight * 0.35; // 35% of screen height

/**
 * Bird detail screen showing comprehensive bird information
 * Features a hero image layout with detailed bird data
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
          <Text style={styles.backButtonTextWhite}>Go Back</Text>
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
          <Text style={styles.backButtonTextWhite}>Go Back</Text>
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section - 35% of screen */}
        <View style={styles.heroContainer}>
          <BirdImage 
            birdId={bird.id} 
            scientificName={bird.scientific_name}
            size={screenWidth} 
            style={styles.heroImage} 
          />
          

          
          {/* Small back button at top */}
          <Pressable style={styles.backButtonOverlay} onPress={() => router.back()}>
            <Text style={styles.backButtonIcon}>←</Text>
          </Pressable>
        </View>
        
        {/* Content card with elevation and rounded corners */}
        <View style={styles.contentCard}>
          {/* Bird name section at top of content */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{displayName}</Text>
            {bird.scientific_name && (
              <Text style={styles.scientificName}>{bird.scientific_name}</Text>
            )}
          </View>
          
          {/* Multi-language names */}
          {(kazakhName || russianName) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Alternative Names</Text>
              <View style={styles.sectionDivider} />
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
          )}
          
          {/* Classification */}
          {(bird.family || bird.order) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Classification</Text>
              <View style={styles.sectionDivider} />
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
          )}
          
          {/* Physical characteristics */}
          {(bird.size || bird.length_cm_min || bird.wingspan_cm_min || bird.weight_g_min) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Physical Characteristics</Text>
              <View style={styles.sectionDivider} />
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
              {(bird.wingspan_cm_min || bird.wingspan_cm_max) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Wingspan:</Text>
                  <Text style={styles.infoValue}>
                    {bird.wingspan_cm_min}-{bird.wingspan_cm_max} cm
                  </Text>
                </View>
              )}
              {(bird.weight_g_min || bird.weight_g_max) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>
                    {bird.weight_g_min}-{bird.weight_g_max} g
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Status in Kazakhstan */}
          {bird.status_kz && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Status in Kazakhstan</Text>
              <View style={styles.sectionDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, styles.conservationStatus]}>
                  {bird.status_kz}
                </Text>
              </View>
            </View>
          )}

          {/* Additional characteristics */}
          {(bird.primary_colors || bird.body_type || bird.beak_type) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Characteristics</Text>
              <View style={styles.sectionDivider} />
              {bird.primary_colors && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Colors:</Text>
                  <Text style={styles.infoValue}>{bird.primary_colors}</Text>
                </View>
              )}
              {bird.body_type && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Body Type:</Text>
                  <Text style={styles.infoValue}>{bird.body_type}</Text>
                </View>
              )}
              {bird.beak_type && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Beak Type:</Text>
                  <Text style={styles.infoValue}>{bird.beak_type}</Text>
                </View>
              )}
            </View>
          )}

          {/* Habitat information */}
          {bird.habitat && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Habitat</Text>
              <View style={styles.sectionDivider} />
              <Text style={styles.habitatText}>{bird.habitat}</Text>
            </View>
          )}

          {/* Additional notes */}
          {bird.notes && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.sectionDivider} />
              <Text style={styles.descriptionText}>{bird.notes}</Text>
            </View>
          )}

          {/* Subspecies in Kazakhstan */}
          {bird.subspecies_in_kz && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Subspecies in Kazakhstan</Text>
              <View style={styles.sectionDivider} />
              <Text style={styles.descriptionText}>{bird.subspecies_in_kz}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  
  // Hero section styles
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: '#f8f9fa'
  },
  heroImage: {
    width: screenWidth,
    height: HERO_HEIGHT,
    borderRadius: 0,
    borderWidth: 0,
  },

  backButtonOverlay: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 3,
  },
  backButtonIcon: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Content card with elevation
  contentCard: {
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 2,
  },
  
  // Section cards
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  sectionTitle: { 
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 16,
  },
  
  // Name rows with enhanced styling
  nameRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  nameLabel: { 
    fontWeight: '700',
    width: 80,
    color: '#495057',
    fontSize: 16,
  },
  nameValue: { 
    flex: 1,
    color: '#212529',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Info rows with better contrast
  infoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
  },
  infoLabel: { 
    fontWeight: '700',
    width: 100,
    color: '#6c757d',
    fontSize: 15,
  },
  infoValue: { 
    flex: 1,
    color: '#212529',
    fontSize: 16,
    fontWeight: '500',
  },
  conservationStatus: {
    fontWeight: '700',
    color: '#0066cc',
  },
  
  // Text content with better spacing
  habitatText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#495057',
    fontWeight: '400',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#495057',
    fontWeight: '400',
  },
  
  // Loading and error states
  centerContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32 
  },
  loadingText: { 
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d' 
  },
  errorText: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8 
  },
  errorSubtext: { 
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16 
  },
  backButton: { 
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6 
  },
  backButtonTextWhite: { 
    color: '#fff',
    fontWeight: 'bold' 
  },
  
  // Bird name section at top of content
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6c757d',
  },
}); 