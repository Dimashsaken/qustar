import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';

interface ExpandableSearchBarProps {
  onSearchChange: (searchText: string) => void;
  placeholder?: string;
  searchText: string;
}

/**
 * Expandable search bar component for bird name search
 * Features smooth animation and search-on-submit functionality with enhanced transitions
 * @param onSearchChange - Callback function for search text changes
 * @param placeholder - Search input placeholder text
 * @param searchText - Current search text value
 * @returns JSX.Element - Expandable search bar component
 */
export const ExpandableSearchBar: React.FC<ExpandableSearchBarProps> = ({
  onSearchChange,
  placeholder = 'Поиск птиц...',
  searchText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(searchText || '');
  const animatedWidth = useRef(new Animated.Value(40)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);

  const screenWidth = Dimensions.get('window').width;
  // Calculate max width to stop at Qustar title (approx 120px for "Qustar" + some spacing)
  const titleWidth = 120; // Approximate width of "Qustar" title at 28px font size
  const spacing = DesignTokens.spacing.md; // Gap between title and search
  const maxWidth = screenWidth - DesignTokens.spacing.lg * 2 - titleWidth - spacing - 40; // Account for padding, title, spacing, and button

  /**
   * Triggers search immediately without debounce
   */
  const triggerSearch = useCallback(() => {
    onSearchChange(localSearchText.trim());
  }, [localSearchText, onSearchChange]);

  /**
   * Expands the search bar and focuses the input with smooth animation
   */
  const expandSearchBar = useCallback(() => {
    setIsExpanded(true);
    
    // Parallel animations for smoother experience
    Animated.parallel([
      Animated.timing(animatedWidth, {
        toValue: maxWidth,
        duration: 250, // Slightly slower for smoother feel
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      textInputRef.current?.focus();
    });
  }, [animatedWidth, animatedOpacity, maxWidth]);

  /**
   * Collapses the search bar and clears search with smooth animation
   */
  const collapseSearchBar = useCallback(() => {
    textInputRef.current?.blur();
    setLocalSearchText('');
    onSearchChange('');
    
    // Parallel animations for smoother collapse
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedWidth, {
        toValue: 40,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsExpanded(false);
    });
  }, [animatedWidth, animatedOpacity, onSearchChange]);

  /**
   * Handles search text input changes (only updates local state, doesn't trigger search)
   */
  const handleSearchTextChange = useCallback((text: string) => {
    setLocalSearchText(text);
  }, []);

  /**
   * Handles search submission (Enter key or search button press)
   */
  const handleSearchSubmit = useCallback(() => {
    textInputRef.current?.blur();
    triggerSearch();
  }, [triggerSearch]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { width: animatedWidth }]}>
        {!isExpanded ? (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={expandSearchBar}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Открыть поиск птиц"
            accessibilityRole="button"
          >
            <Ionicons
              name="search"
              size={20}
              color={Colors.light.primary}
            />
          </TouchableOpacity>
        ) : (
          <Animated.View 
            style={[styles.expandedContent, { opacity: animatedOpacity }]}
          >
            <View style={styles.inputContainer}>
              <TouchableOpacity
                onPress={handleSearchSubmit}
                style={styles.searchIconButton}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Выполнить поиск"
                accessibilityRole="button"
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={Colors.light.primary}
                />
              </TouchableOpacity>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={localSearchText}
                onChangeText={handleSearchTextChange}
                onSubmitEditing={handleSearchSubmit}
                placeholder={placeholder}
                placeholderTextColor="#CCCCCC" // Lighter placeholder color
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                accessible={true}
                accessibilityLabel="Поле поиска птиц"
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={collapseSearchBar}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Закрыть поиск"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={18}
                color={Colors.light.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
  },
  searchContainer: {
    height: 40,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...DesignTokens.shadows.subtle,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: DesignTokens.spacing.sm,
  },
  searchIconButton: {
    paddingHorizontal: DesignTokens.spacing.xs,
    paddingVertical: DesignTokens.spacing.sm,
    marginRight: DesignTokens.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  closeButton: {
    width: 36,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing.xs,
  },
}); 