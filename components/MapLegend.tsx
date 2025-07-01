import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../constants/Colors';

interface MapLegendProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Educational map legend component as bottom sheet - based on "Птицы Казахстана. Полевой определитель"
 * Uses TikTok-style half-screen overlay allowing map interaction behind
 * @param visible - Whether the legend bottom sheet is visible
 * @param onClose - Function to close the legend
 * @returns JSX.Element - Map legend bottom sheet component
 */
export const MapLegend: React.FC<MapLegendProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Invisible background area - tapping closes the modal */}
        <Pressable style={styles.backgroundArea} onPress={onClose} />
        
        {/* Bottom sheet content */}
        <View style={styles.bottomSheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Условные обозначения карт
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Legend Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Цветовые обозначения:
              </Text>
              
              <View style={styles.legendItems}>
                <LegendItem 
                  color="#FFD700" 
                  label="Линька" 
                  description="Желтый - места смены оперения"
                />
                <LegendItem 
                  color="#4A90E2" 
                  label="Зимовка" 
                  description="Синий - зимние места обитания"
                />
                <LegendItem 
                  color="#7ED321" 
                  label="Оседлый вид (встречается круглый год)" 
                  description="Зеленый - виды, постоянно обитающие в регионе"
                />
                <LegendItem 
                  pattern="diagonal" 
                  patternColor="#87CEEB"
                  label="Весной и осенью пролетает" 
                  description="Голубые линии - весенние и осенние миграционные пути"
                />
                <LegendItem 
                  pattern="diagonal" 
                  patternColor="#FFB6C1"
                  label="Летом встречается (не гнездится)" 
                  description="Розовые линии - летние встречи без размножения"
                />
                <LegendItem 
                  symbol="♦" 
                  symbolColor="#E53E3E"
                  label="В любое время года может встречаться" 
                  description="Красный ромб - случайные встречи в любой сезон"
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                По материалам "Птицы Казахстана. Полевой определитель"
              </Text>
              <Text style={styles.footerSubtext}>
                Проведите пальцем вниз или нажмите вне области для закрытия
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
  pattern?: 'diagonal';
  patternColor?: string;
  symbol?: string;
  symbolColor?: string;
  label: string;
  description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, pattern, patternColor, symbol, symbolColor, label, description }) => (
  <View style={styles.legendItem}>
    <View style={styles.legendIndicator}>
      {color ? (
        <View style={[styles.colorPatch, { backgroundColor: color }]} />
      ) : pattern ? (
        <View style={styles.patternPatch}>
          <View style={[styles.diagonalLine1, { backgroundColor: patternColor || '#4A90E2' }]} />
          <View style={[styles.diagonalLine2, { backgroundColor: patternColor || '#4A90E2' }]} />
          <View style={[styles.diagonalLine3, { backgroundColor: patternColor || '#4A90E2' }]} />
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
  // Overlay and bottom sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  backgroundArea: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '45%', // Reduced height since we have less content
    maxHeight: '60%',
    ...Platform.select({
      android: {
        elevation: 20,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
    }),
  },
  
  // Drag handle
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
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
    position: 'absolute',
    right: DesignTokens.spacing.lg,
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
    marginVertical: DesignTokens.spacing.md,
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
    gap: DesignTokens.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: DesignTokens.spacing.xs,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
    fontSize: 15,
    color: '#000',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  legendDescription: {
    color: '#666',
    lineHeight: 16,
    fontSize: 13,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  
  // Footer
  footer: {
    paddingVertical: DesignTokens.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: DesignTokens.spacing.md,
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
    marginBottom: DesignTokens.spacing.xs,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  footerSubtext: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 12,
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
});