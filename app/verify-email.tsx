import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

// Hide the default expo navigation header
export const unstable_settings = {
  headerShown: false,
};

/**
 * Email verification screen for OTP verification after signup
 * @returns JSX.Element - Email verification screen
 */
export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp, loading } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
   * Verifies the OTP code
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
      const { error } = await verifyOtp(email, otpCode);
      
      if (error) {
        Alert.alert('Ошибка верификации', error.message);
        return;
      }

      Alert.alert(
        'Подтверждение успешно!',
        'Ваш email подтвержден. Теперь вы можете пользоваться приложением.',
        [
          {
            text: 'Продолжить',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Что-то пошло не так. Попробуйте снова.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Resends verification code
   */
  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Email не найден');
      return;
    }

    try {
      setIsResending(true);
      const error = await resendOtp(email);
      
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
    router.back();
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
          <View style={styles.content}>
            {/* Back Button */}
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>
                ←
              </Text>
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📧</Text>
              </View>
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
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      { borderColor: digit ? '#007AFF' : '#E0E0E0' }
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) => 
                      handleKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isVerifying}
              >
                <LinearGradient
                  colors={['#007AFF', '#0056CC']}
                  style={styles.verifyButtonGradient}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.verifyButtonText}>
                      Подтвердить
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Не получили код?
                </Text>
                <Pressable
                  onPress={handleResendCode}
                  disabled={isResending || resendCooldown > 0}
                  style={[
                    styles.resendButton,
                    (isResending || resendCooldown > 0) && styles.resendButtonDisabled
                  ]}
                >
                  <Text style={styles.resendButtonText}>
                    {isResending 
                      ? 'Отправка...' 
                      : resendCooldown > 0 
                        ? `Повторить (${resendCooldown}с)`
                        : 'Отправить еще раз'
                    }
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#666',
  },
  email: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 40,
  },
  otpLabel: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    fontWeight: '600',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actions: {
    gap: 24,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 16,
    color: '#666',
  },
  resendButton: {
    padding: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 