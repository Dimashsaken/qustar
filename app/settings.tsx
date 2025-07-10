import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    StatusBar as RNStatusBar,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { FeedbackForm } from '../components/FeedbackForm';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';

/**
 * Settings screen with app preferences and logout functionality
 * @returns JSX.Element - Settings screen component
 */
export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Handles opening feedback modal
   */
  const handleOpenFeedback = () => {
    setShowFeedbackModal(true);
  };

  /**
   * Handles closing feedback modal
   */
  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
  };

  /**
   * Handles opening change password modal
   */
  const handleOpenChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  /**
   * Handles closing change password modal
   */
  const handleCloseChangePassword = () => {
    setShowChangePasswordModal(false);
  };

  /**
   * Handles sign out with confirmation
   */
  const handleSignOut = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось выйти из системы');
            }
          }
        }
      ]
    );
  };

  /**
   * Renders settings item
   */
  const renderSettingItem = (
    title: string,
    iconName: React.ComponentProps<typeof IconSymbol>['name'],
    onPress?: () => void,
    showChevron: boolean = true
  ) => (
    <Pressable 
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <IconSymbol name={iconName} size={20} color={Colors.light.textMuted} />
        <ThemedText type="default" style={styles.settingText}>
          {title}
        </ThemedText>
      </View>
      {showChevron && (
        <IconSymbol name="chevron.right" size={16} color={Colors.light.textMuted} />
      )}
    </Pressable>
  );

  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Настройки
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* App Settings */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Приложение
            </ThemedText>
            {renderSettingItem('Язык', 'globe')}
            {renderSettingItem('Темная тема', 'moon.fill')}
          </ThemedView>

          {/* Account Settings */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Аккаунт
            </ThemedText>
            {renderSettingItem('Изменить пароль', 'key.fill', handleOpenChangePassword)}
          </ThemedView>

          {/* Help & Support */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Помощь и поддержка
            </ThemedText>
            {renderSettingItem('Обратная связь', 'envelope.fill', handleOpenFeedback)}
            {renderSettingItem('Политика конфиденциальности', 'doc.text', () => router.push('/privacy-policy'))}
            {renderSettingItem('О приложении', 'info.circle')}
          </ThemedView>

          {/* Logout Button */}
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <IconSymbol name="arrow.right.square" size={20} color={Colors.light.surface} />
            <ThemedText type="bold" style={styles.signOutText}>
              Выйти из аккаунта
            </ThemedText>
          </Pressable>
        </ScrollView>

        {/* Feedback Modal */}
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={showFeedbackModal}
          onRequestClose={handleCloseFeedback}
        >
          <FeedbackForm
            onSubmitSuccess={handleCloseFeedback}
            onCancel={handleCloseFeedback}
          />
        </Modal>

                 {/* Change Password Modal */}
         <Modal
           animationType="slide"
           presentationStyle="pageSheet"
           visible={showChangePasswordModal}
           onRequestClose={handleCloseChangePassword}
         >
           <ChangePasswordForm
             onSuccess={handleCloseChangePassword}
             onCancel={handleCloseChangePassword}
           />
         </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: DesignTokens.spacing.sm,
  },
  headerTitle: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40, // Same as back button to center title
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.light.surface,
    marginTop: DesignTokens.spacing.sm,
    paddingBottom: DesignTokens.spacing.sm,
  },
  sectionTitle: {
    color: Colors.light.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    color: Colors.light.text,
    marginLeft: DesignTokens.spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.error,
    marginHorizontal: DesignTokens.spacing.lg,
    marginVertical: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
  },
  signOutText: {
    color: Colors.light.surface,
    marginLeft: DesignTokens.spacing.sm,
  },
}); 