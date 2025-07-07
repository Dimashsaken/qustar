import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors, DesignTokens } from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';
import { ThemedText } from './ThemedText';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

/**
 * Authentication modal component with sign-in and sign-up forms
 * @param visible - Whether modal is visible
 * @param onClose - Callback to close modal
 * @param initialMode - Initial auth mode (signin/signup)
 * @returns JSX.Element - Authentication modal component
 */
export const AuthModal: React.FC<AuthModalProps> = ({ 
  visible, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const { signIn, signUp, loading } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert('Ошибка', 'Пароли не совпадают');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
        return;
      }
    }

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Ошибка входа', error.message);
          return;
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          Alert.alert('Ошибка регистрации', error.message);
          return;
        }
        Alert.alert(
          'Регистрация успешна',
          'Проверьте свою почту для подтверждения аккаунта'
        );
      }
      
      handleClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова.');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <View style={styles.modal}>
          <ScrollView 
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {mode === 'signin' ? 'Вход' : 'Регистрация'}
              </ThemedText>
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <ThemedText type="bold" style={styles.label}>
                    Полное имя
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Введите ваше имя"
                    placeholderTextColor={Colors.light.textMuted}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <ThemedText type="bold" style={styles.label}>
                  Email
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Введите email"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="bold" style={styles.label}>
                  Пароль
                </ThemedText>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Введите пароль"
                  placeholderTextColor={Colors.light.textMuted}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <ThemedText type="bold" style={styles.label}>
                    Подтвердите пароль
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Подтвердите пароль"
                    placeholderTextColor={Colors.light.textMuted}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                style={[
                  styles.submitButton,
                  (loading || !email || !password) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.light.surface} />
                ) : (
                  <ThemedText type="bold" style={styles.submitButtonText}>
                    {mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
                  </ThemedText>
                )}
              </Pressable>

              {/* Toggle Mode */}
              <View style={styles.toggleContainer}>
                <ThemedText type="default" style={styles.toggleText}>
                  {mode === 'signin' 
                    ? 'Нет аккаунта? ' 
                    : 'Уже есть аккаунт? '
                  }
                </ThemedText>
                <Pressable onPress={toggleMode}>
                  <ThemedText type="bold" style={styles.toggleButton}>
                    {mode === 'signin' ? 'Регистрация' : 'Вход'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: DesignTokens.spacing.xl,
    borderTopRightRadius: DesignTokens.spacing.xl,
    maxHeight: '80%',
    ...DesignTokens.shadows.card,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    color: Colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.light.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    padding: DesignTokens.spacing.xl,
  },
  inputGroup: {
    marginBottom: DesignTokens.spacing.lg,
  },
  label: {
    marginBottom: DesignTokens.spacing.sm,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: DesignTokens.borderRadius.input,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.md,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: DesignTokens.borderRadius.button,
    paddingVertical: DesignTokens.spacing.md,
    alignItems: 'center',
    marginTop: DesignTokens.spacing.md,
    ...DesignTokens.shadows.subtle,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  submitButtonText: {
    color: Colors.light.surface,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: DesignTokens.spacing.lg,
  },
  toggleText: {
    color: Colors.light.textMuted,
  },
  toggleButton: {
    color: Colors.light.primary,
  },
}); 