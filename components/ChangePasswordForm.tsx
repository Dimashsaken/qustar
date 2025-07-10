import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { Colors, DesignTokens } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form component for changing user password
 * @param onSuccess - Callback when password change is successful
 * @param onCancel - Callback when user cancels
 * @returns JSX.Element - Change password form
 */
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { changePassword, loading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Ошибка', 'Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Ошибка', 'Новый пароль должен содержать не менее 6 символов');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Ошибка', 'Новый пароль должен отличаться от текущего');
      return;
    }

    try {
      const error = await changePassword(newPassword);
      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      Alert.alert(
        'Успешно', 
        'Пароль был успешно изменен',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить пароль. Попробуйте снова.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>
          <Text style={styles.title}>Изменить пароль</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Текущий пароль</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Введите текущий пароль"
              placeholderTextColor={Colors.light.textMuted}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Новый пароль</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Введите новый пароль"
              placeholderTextColor={Colors.light.textMuted}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Подтвердите новый пароль</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Повторите новый пароль"
              placeholderTextColor={Colors.light.textMuted}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.light.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Изменить пароль</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cancelButton: {
    padding: DesignTokens.spacing.sm,
  },
  cancelText: {
    color: Colors.light.primary,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerRight: {
    width: 50,
  },
  form: {
    padding: DesignTokens.spacing.lg,
    gap: DesignTokens.spacing.lg,
  },
  inputGroup: {
    gap: DesignTokens.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: DesignTokens.borderRadius.input,
    padding: DesignTokens.spacing.md,
    fontSize: 16,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.borderRadius.button,
    alignItems: 'center',
    marginTop: DesignTokens.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 