import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import type { CreateFeedbackData, FeedbackType } from '@/types/feedback';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Feedback form component for user feedback submission
 * @param props - Component props
 * @returns Feedback form component
 */
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const { submitFeedback, isSubmitting } = useFeedback();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');

  const feedbackTypes: { value: FeedbackType; label: string }[] = [
    { value: 'general', label: 'Общие отзывы' },
    { value: 'bug_report', label: 'Сообщить об ошибке' },
    { value: 'feature_request', label: 'Предложить функцию' },
    { value: 'improvement', label: 'Предложение по улучшению' },
    { value: 'other', label: 'Другое' },
  ];

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите тему');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваше сообщение');
      return;
    }

    const feedbackData: CreateFeedbackData = {
      feedback_type: feedbackType,
      subject: subject.trim(),
      message: message.trim(),
      user_email: userEmail.trim() || undefined,
    };

    try {
      const result = await submitFeedback.mutateAsync(feedbackData);
      
      if (result.success) {
        Alert.alert(
          'Спасибо!',
          'Ваш отзыв был успешно отправлен. Мы ценим ваше мнение!',
          [
            {
              text: 'ОК',
              onPress: () => {
                // Reset form
                setSubject('');
                setMessage('');
                setFeedbackType('general');
                onSubmitSuccess?.();
              },
            },
          ]
        );
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось отправить отзыв');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла непредвиденная ошибка');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Отправить отзыв</Text>
        
        {/* Feedback Type */}
        <Text style={styles.label}>Тип отзыва</Text>
        <View style={styles.typeContainer}>
          {feedbackTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                feedbackType === type.value && styles.typeButtonSelected,
              ]}
              onPress={() => setFeedbackType(type.value)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  feedbackType === type.value && styles.typeButtonTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={styles.label}>Тема</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Краткое описание вашего отзыва"
          maxLength={100}
        />

        {/* Message */}
        <Text style={styles.label}>Сообщение</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Пожалуйста, предоставьте подробный отзыв..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={1000}
        />

        {/* Email */}
        {!user && (
          <>
            <Text style={styles.label}>Email (необязательно)</Text>
            <TextInput
              style={styles.input}
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Отправляется...' : 'Отправить отзыв'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: Colors.light.text,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
}); 