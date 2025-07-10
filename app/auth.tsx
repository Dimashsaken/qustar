import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

const { height } = Dimensions.get('window');

// Hide the default expo navigation header
export const unstable_settings = {
  headerShown: false,
};

/**
 * Authentication screen component - first screen users see
 * Handles sign-in, sign-up, and password recovery flows with modern white theme
 * @returns JSX.Element - Authentication screen
 */
export default function AuthScreen() {
  const { signIn, signUp, resetPassword, loading } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setIsResettingPassword(false);
  };

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return;
    }

    if (mode === 'forgot') {
      try {
        setIsResettingPassword(true);
        const error = await resetPassword(email);
        if (error) {
          Alert.alert('Ошибка', error.message);
          return;
        }
        
        // Navigate directly to reset password page
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось отправить письмо. Попробуйте снова.');
      } finally {
        setIsResettingPassword(false);
      }
      return;
    }

    if (!password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
        return;
      }
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
        // Navigate to main app after successful sign-in
        router.replace('/(tabs)');
      } else {
        console.log('Starting signup process for:', email);
        const { user, error } = await signUp(email, password, fullName);
        
        if (error) {
          console.log('Signup error:', error);
          Alert.alert('Ошибка регистрации', error.message);
          return;
        }
        
        console.log('Signup successful, user:', user);
        console.log('Navigating to verification page...');
        
        // Navigate to verification page
        console.log('Redirecting to verify-email page');
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.log('Caught error during auth process:', error);
      Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова.');
    }
  };

  const toggleMode = () => {
    if (mode === 'signin') {
      setMode('signup');
    } else if (mode === 'signup') {
      setMode('signin');
    } else {
      setMode('signin');
    }
    resetForm();
  };

  const handleForgotPassword = () => {
    setMode('forgot');
    resetForm();
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa', '#ffffff']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.appTitle}>Qustar</Text>
              </View>
              <Text style={styles.description}>
                Откройте для себя удивительный мир пернатых
              </Text>
            </View>

            {/* Auth Form */}
            <View style={styles.authCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {mode === 'signin' ? 'Добро пожаловать!' : 
                   mode === 'signup' ? 'Регистрация' : 'Восстановление пароля'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {mode === 'signin' ? 'Войдите в свой аккаунт' : 
                   mode === 'signup' ? 'Создайте новый аккаунт' :
                   'Введите email для получения инструкций'}
                </Text>
              </View>

              <View style={styles.form}>
                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Полное имя
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Введите ваше имя"
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Email
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Введите email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {mode !== 'forgot' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Пароль
                    </Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Введите пароль"
                        placeholderTextColor="#999"
                        secureTextEntry
                        autoComplete="password"
                      />
                      {mode === 'signin' && (
                        <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                          <Text style={styles.forgotPasswordText}>
                            Забыли пароль?
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}

                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Подтвердите пароль
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Подтвердите пароль"
                      placeholderTextColor="#999"
                      secureTextEntry
                      autoComplete="password"
                    />
                  </View>
                )}

                <Pressable
                  style={[styles.submitButton, (loading || isResettingPassword) && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || isResettingPassword}
                >
                  <LinearGradient
                    colors={['#4285F4', '#1565C0']}
                    style={styles.submitButtonGradient}
                  >
                    {(loading || isResettingPassword) ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {mode === 'signin' ? 'Войти' : 
                         mode === 'signup' ? 'Создать аккаунт' : 'Отправить код'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={styles.switchContainer}>
                  {mode === 'forgot' ? (
                    <Pressable onPress={handleBackToSignIn}>
                      <Text style={styles.switchLink}>
                        Вернуться к входу
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <Text style={styles.switchText}>
                        {mode === 'signin' 
                          ? 'Нет аккаунта? ' 
                          : 'Уже есть аккаунт? '
                        }
                      </Text>
                      <Pressable onPress={toggleMode}>
                        <Text style={styles.switchLink}>
                          {mode === 'signin' ? 'Зарегистрироваться' : 'Войти'}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  passwordContainer: {
    gap: 4,
  },
  label: {
    fontSize: 16,
    marginLeft: 4,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  switchText: {
    fontSize: 16,
    color: '#666',
  },
  switchLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 