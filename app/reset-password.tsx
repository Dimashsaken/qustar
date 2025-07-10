import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

/**
 * Password reset screen with OTP verification and new password input
 * @returns JSX.Element - Password reset screen
 */
export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyPasswordResetOtp, updatePasswordAfterReset, resetPassword, loading } = useAuth();
  
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Start resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Handles OTP input change
   */
  const handleOtpChange = (value: string, index: number) => {
    // Check if OTP is already complete and prevent further input
    const currentOtpFilled = otp.filter(digit => digit !== '').length;
    
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Check if OTP is complete after paste
      const filledDigits = newOtp.filter(digit => digit !== '').length;
      if (filledDigits === 6) {
        // Dismiss keyboard by blurring all inputs
        inputRefs.current.forEach(ref => ref?.blur());
      } else {
        // Focus last filled input or next empty
        const lastIndex = Math.min(pastedOtp.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
      }
    } else {
      // Handle single digit input
      if (value === '' || currentOtpFilled < 6 || otp[index] !== '') {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        if (value) {
          // Check if this completes the OTP
          const filledDigits = newOtp.filter(digit => digit !== '').length;
          if (filledDigits === 6) {
            // Dismiss keyboard by blurring all inputs
            inputRefs.current.forEach(ref => ref?.blur());
          } else if (index < 5) {
            // Move to next input
            inputRefs.current[index + 1]?.focus();
          }
        }
      }
    }
  };

  /**
   * Handles backspace key
   */
  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Verifies the OTP code and proceeds to password input
   */
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Ошибка', 'Пожалуйста, введите 6-значный код');
      return;
    }

    if (!email) {
      Alert.alert('Ошибка', 'Email не найден');
      return;
    }

    try {
      setIsVerifying(true);
      const { error } = await verifyPasswordResetOtp(email, otpCode);
      
      if (error) {
        Alert.alert('Ошибка верификации', error.message);
        return;
      }

      // Proceed to password input step
      setStep('password');
    } catch (error) {
      Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Updates the password after OTP verification
   */
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, введите новый пароль');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    try {
      setIsUpdating(true);
      const error = await updatePasswordAfterReset(newPassword);
      
      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      Alert.alert(
        'Пароль изменен!',
        'Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.',
        [
          {
            text: 'Войти',
            onPress: () => router.replace('/auth'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить пароль. Попробуйте снова.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Resends password reset code
   */
  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Email не найден');
      return;
    }

    try {
      setIsResending(true);
      const error = await resetPassword(email);
      
      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      Alert.alert('Код отправлен', 'Новый код отправлен на ваш email');
      setResendCooldown(60); // 60 seconds cooldown
      setOtp(['', '', '', '', '', '']); // Clear current input
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отправить код');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    if (step === 'password') {
      setStep('otp');
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          <View style={styles.content}>
            {/* Back Button */}
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>
                ←
              </Text>
            </Pressable>

            {step === 'otp' ? (
              <>
                {/* OTP Step Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>
                    Проверьте почту
                  </Text>
                  <Text style={styles.subtitle}>
                    Мы отправили 6-значный код на
                  </Text>
                  <Text style={styles.email}>
                    {email}
                  </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>
                    Введите код
                  </Text>
                  <View style={styles.otpInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        style={[
                          styles.otpInput,
                          digit && styles.otpInputFilled,
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                        keyboardType="number-pad"
                        maxLength={6}
                        textAlign="center"
                        autoFocus={index === 0}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>

                {/* Verify Button */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    (isVerifying || loading) && styles.buttonDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={isVerifying || loading}
                >
                  {isVerifying || loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Проверить код
                    </Text>
                  )}
                </Pressable>

                {/* Resend Code */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Не получили код?
                  </Text>
                  <Pressable
                    style={[
                      styles.resendButton,
                      (resendCooldown > 0 || isResending) && styles.buttonDisabled,
                    ]}
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || isResending}
                  >
                    {isResending ? (
                      <ActivityIndicator color="#007AFF" size="small" />
                    ) : (
                      <Text style={styles.resendButtonText}>
                        {resendCooldown > 0 
                          ? `Отправить повторно (${resendCooldown})`
                          : 'Отправить повторно'
                        }
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {/* Password Step Header */}
                <View style={styles.header}>
                 
                  <Text style={styles.title}>
                    Новый пароль
                  </Text>
                  <Text style={styles.subtitle}>
                    Введите новый пароль для вашего аккаунта
                  </Text>
                </View>

                {/* Password Inputs */}
                <View style={styles.passwordContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Новый пароль
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Введите новый пароль"
                      placeholderTextColor="#999"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="new-password"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Подтвердите пароль
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Подтвердите новый пароль"
                      placeholderTextColor="#999"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="new-password"
                    />
                  </View>
                </View>

                {/* Update Password Button */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    isUpdating && styles.buttonDisabled,
                  ]}
                  onPress={handleUpdatePassword}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Изменить пароль
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
    </>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 5,
    left: 24,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  otpInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F4FF',
  },
  passwordContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 