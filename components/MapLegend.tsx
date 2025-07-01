import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../constants/Colors';

interface MapLegendProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Educational map legend component based on "Қазақстан құстары. Далалық анықтағыш"
 * Uses exact mapping conventions from the Kazakhstan field guide
 * @param visible - Whether the legend modal is visible
 * @param onClose - Function to close the legend
 * @returns JSX.Element - Map legend tutorial modal
 */
export const MapLegend: React.FC<MapLegendProps> = ({ visible, onClose }) => {
  const isAndroid = Platform.OS === 'android';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={isAndroid}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={onClose}
    >
      <View style={isAndroid ? styles.androidModalOverlay : styles.iosModalContainer}>
        <View style={isAndroid ? styles.androidModalContent : styles.iosModalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Шарттық белгілер
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Map Legend from Kazakhstan Field Guide */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Шарттық белгілер:
              </Text>
              
              <View style={styles.legendItems}>
                <LegendItem 
                  color="#FFD700" 
                  label="ұялау" 
                  description="Гнездование"
                />
                <LegendItem 
                  color="#4A90E2" 
                  label="қыстау" 
                  description="Зимовка"
                />
                <LegendItem 
                  color="#7ED321" 
                  label="отырықшы түр (жыл бойы кездесетін)" 
                  description="Оседлый вид (встречается круглый год)"
                />
                <LegendItem 
                  pattern="diagonal" 
                  label="көктемде және күзде ұшып өтеді" 
                  description="Пролетает весной и осенью"
                />
                <LegendItem 
                  pattern="pink-diagonal" 
                  label="жазда кездеседі (ұзақмайын)" 
                  description="Встречается летом (недолго)"
                />
                <LegendItem 
                  symbol="♦" 
                  symbolColor="#E53E3E"
                  label="кез келген жыл маусымында кездесуі ұшын келеді" 
                  description="Может встречаться в любое время года"
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                "Қазақстан құстары. Далалық анықтағыш" бойынша
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Individual legend item component
 */
interface LegendItemProps {
  color?: string;
  pattern?: 'diagonal' | 'pink-diagonal';
  symbol?: string;
  symbolColor?: string;
  label: string;
  description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, pattern, symbol, symbolColor, label, description }) => (
  <View style={styles.legendItem}>
    <View style={styles.legendIndicator}>
      {color ? (
        <View style={[styles.colorPatch, { backgroundColor: color }]} />
      ) : pattern ? (
        <View style={styles.patternPatch}>
          {pattern === 'diagonal' ? (
            // Blue diagonal lines
            <>
              <View style={[styles.diagonalLine1, { backgroundColor: '#4A90E2' }]} />
              <View style={[styles.diagonalLine2, { backgroundColor: '#4A90E2' }]} />
              <View style={[styles.diagonalLine3, { backgroundColor: '#4A90E2' }]} />
            </>
          ) : (
            // Pink diagonal lines  
            <>
              <View style={[styles.diagonalLine1, { backgroundColor: '#ff69b4' }]} />
              <View style={[styles.diagonalLine2, { backgroundColor: '#ff69b4' }]} />
              <View style={[styles.diagonalLine3, { backgroundColor: '#ff69b4' }]} />
            </>
          )}
        </View>
      ) : symbol ? (
        <Text style={[styles.symbolPatch, { color: symbolColor || '#000' }]}>{symbol}</Text>
      ) : null}
    </View>
    <View style={styles.legendContent}>
      <Text style={styles.legendLabel}>
        {label}
      </Text>
      <Text style={styles.legendDescription}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // iOS Modal Container
  iosModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iosModalContent: {
    flex: 1,
  },
  
  // Android Modal Styles
  androidModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  androidModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        paddingTop: DesignTokens.spacing.lg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
    }),
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  closeIcon: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
    backgroundColor: '#fff',
  },
  
  // Sections
  section: {
    marginVertical: DesignTokens.spacing.lg,
  },
  sectionTitle: {
    marginBottom: DesignTokens.spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  
  // Legend items
  legendItems: {
    gap: DesignTokens.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: DesignTokens.spacing.sm,
  },
  legendIndicator: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.md,
  },
  colorPatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  patternPatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
  },
  diagonalLine1: {
    position: 'absolute',
    width: 30,
    height: 2,
    top: 3,
    left: -5,
    transform: [{ rotate: '45deg' }],
  },
  diagonalLine2: {
    position: 'absolute',
    width: 30,
    height: 2,
    top: 9,
    left: -5,
    transform: [{ rotate: '45deg' }],
  },
  diagonalLine3: {
    position: 'absolute',
    width: 30,
    height: 2,
    top: 15,
    left: -5,
    transform: [{ rotate: '45deg' }],
  },
  symbolPatch: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
    fontSize: 16,
    color: '#000',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  legendDescription: {
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  
  // Footer
  footer: {
    paddingVertical: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
}); 