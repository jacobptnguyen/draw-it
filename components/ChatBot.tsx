// ChatBot.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  ChevronLeft,
  ArrowUp,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Menu, Provider, Portal, Dialog, Button } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useChatSession } from '@/hooks/useChatSession';
import { useAI } from '@/hooks/useAI';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useDrawings } from '@/hooks/useDrawings';
import { useProfile } from '@/hooks/useProfile';
import { useStreak } from '@/hooks/useStreak';
import { useAuth } from '@/contexts/AuthContext';
import { useRateLimit } from '@/hooks/useRateLimit';
import { DAILY_CHALLENGE_DRAWING_ID } from '@/constants/DrawingIds';
import { useDailyChallengeLimit } from '@/hooks/useDailyChallengeLimit';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { ChatMessage } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatImage } from '@/components/ChatImage';
import ImagePickerModal from '@/components/ImagePickerModal';

const TypingDots = ({ isDark }: { isDark: boolean }) => {
  const [dotOpacity] = useState<Animated.Value[]>([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.stagger(200, [
          Animated.timing(dotOpacity[0], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity[1], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity[2], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.stagger(200, [
          Animated.timing(dotOpacity[0], {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity[1], {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity[2], {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();

    return () => {
      dotOpacity.forEach(dot => dot.stopAnimation());
    };
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {dotOpacity.map((opacity, index) => (
        <Animated.View
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: isDark ? '#D1D5DB' : '#6B7280',
            marginHorizontal: 2,
            opacity,
          }}
        />
      ))}
    </View>
  );
};

const ChatBot = () => {
  const params = useLocalSearchParams();
  const [input, setInput] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isConfirmDialog, setIsConfirmDialog] = useState(false);
  const [dialogCallback, setDialogCallback] = useState<(() => void) | null>(null);
  const [newDrawingName, setNewDrawingName] = useState(
    Array.isArray(params.drawingTitle) ? params.drawingTitle[0] : params.drawingTitle || ''
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [hasGeneratedDailyChallenge, setHasGeneratedDailyChallenge] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const windowDimensions = useWindowDimensions();
  const styles = createStyles(isDark, windowDimensions.width);
  const { width: screenWidth } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';

  // Set document body background color on web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#121212' : '#FFFFFF';
    }
  }, [isDark, isWeb]);


  const routeDrawingId = Array.isArray(params.drawingId) ? params.drawingId[0] : params.drawingId;
  const routeDrawingTitle = Array.isArray(params.drawingTitle) ? params.drawingTitle[0] : params.drawingTitle;

  const {
    messages,
    session,
    createNewSession,
    findOrCreateSession,
    addMessage,
    deleteSession,
    loadMessages,
    isLoading: isLoadingMessages,
  } = useChatSession();
  const { sendDrawingForFeedback, compareWithReference, isLoading: isLoadingAI } = useAI();
  const { showImagePickerOptions, isUploading } = useImagePicker();
  const { user: authUser } = useAuth();
  const { updateDrawing, deleteDrawing } = useDrawings();
  const { profile } = useProfile();
  const { incrementStreak } = useStreak(authUser?.id);
  const { 
    dailyMessageCount, 
    dailyMessageLimit, 
    canSendMessage, 
    remainingMessages, 
    incrementMessageCount 
  } = useRateLimit();
  const { 
    canRefreshChallenge, 
    incrementRefreshCount 
  } = useDailyChallengeLimit();
  const { todaysChallenge, generateChallengeContent } = useDailyChallenges();

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const typewriterEffect = async (text: string) => {
    setTypingText('');
    setShowTypewriter(true);
    
    for (let i = 0; i <= text.length; i++) {
      setTypingText(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 2));
    }
    
    setTimeout(() => {
      setShowTypewriter(false);
      setTypingText('');
    }, 100);
  };

  useEffect(() => {
    const initializeSession = async () => {
      if (!session && routeDrawingId) {
        try {
          console.log('💬 [ChatBot] Initializing session for drawing:', routeDrawingId);
          await findOrCreateSession(routeDrawingId, routeDrawingTitle);
          console.log('💬 [ChatBot] Session initialization complete');
        } catch (error) {
          console.error('💬 [ChatBot] Failed to initialize session:', error);
        }
      }
    };
    
    initializeSession();
  }, [routeDrawingId, routeDrawingTitle]);

  // Reset generation state when session changes
  useEffect(() => {
    setHasGeneratedDailyChallenge(false);
  }, [session?.id]);

  // Auto-generate daily challenge content when session is ready (only once per day)
  useEffect(() => {
    const autoGenerateDailyChallenge = async () => {
      if (
        session?.id && 
        routeDrawingId === DAILY_CHALLENGE_DRAWING_ID && 
        !isLoadingMessages && // Wait for messages to finish loading
        todaysChallenge // Wait for today's challenge to load from database
      ) {
        // Check if daily challenge content has already been generated for today
        const hasChallengeContent = messages.some(msg => 
          msg.sender === 'ai' && 
          msg.text && 
          msg.text.includes(todaysChallenge.title)
        );
        
        if (!hasChallengeContent && !hasGeneratedDailyChallenge) {
          try {
            console.log('🎨 [ChatBot] Auto-generating daily challenge content from database challenge...');
            setIsTyping(true);
            
            // Use the challenge from the database instead of generating new one
            const challengeText = `**Today's Challenge:** ${todaysChallenge.title}\n\n${todaysChallenge.prompt}`;
            
            // Add the challenge description as AI message
            await addMessage(challengeText, 'ai', 'text');
            
            // Add the reference image
            const referenceImageUrl = todaysChallenge.thumbnail_url;
            console.log('🎨 [ChatBot] Adding reference image:', referenceImageUrl);
            await addMessage('Here\'s your reference image to help guide your drawing:', 'ai', 'image', referenceImageUrl);
            
            // Mark as generated to prevent regeneration
            setHasGeneratedDailyChallenge(true);
            
            setIsTyping(false);
            console.log('🎨 [ChatBot] Daily challenge content generated successfully from database');
          } catch (error) {
            console.error('🎨 [ChatBot] Failed to auto-generate daily challenge:', error);
            setIsTyping(false);
            // Add fallback message
            await addMessage('Welcome to today\'s daily challenge! Upload your drawing and I\'ll provide feedback to help you improve.', 'ai', 'text');
            // Still mark as generated to prevent retry
            setHasGeneratedDailyChallenge(true);
          }
        } else if (hasChallengeContent) {
          console.log('🎨 [ChatBot] Daily challenge content already exists for today, skipping generation');
          // Mark as generated to prevent regeneration
          setHasGeneratedDailyChallenge(true);
        }
      }
    };
    
    autoGenerateDailyChallenge();
  }, [session?.id, routeDrawingId, isLoadingMessages, messages, hasGeneratedDailyChallenge, todaysChallenge]);


  // Note: Messages are now loaded automatically by findOrCreateSession
  // This useEffect is no longer needed but kept for debugging
  useEffect(() => {
    if (routeDrawingId && session?.id) {
      console.log('💬 [ChatBot] Session loaded, messages should already be loaded by findOrCreateSession');
    }
  }, [routeDrawingId, session?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const showGenericDialog = (
    title: string,
    message: string,
    isConfirm: boolean,
    callback?: () => void
  ) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsConfirmDialog(isConfirm);
    setDialogCallback(() => callback);
    setDialogVisible(true);
  };

  const showErrorDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsConfirmDialog(false); // Not a confirm dialog
    setDialogCallback(null);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setDialogCallback(null);
  };

  const executeDialogCallback = () => {
    if (dialogCallback) {
      dialogCallback();
    }
    hideDialog();
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !session || isLoadingAI || isLoadingMessages) return;
    
    // Check rate limit before sending message
    if (!canSendMessage) {
      showGenericDialog(
        'Daily Limit Reached', 
        `You've reached your daily limit of ${dailyMessageLimit} messages. Come back tomorrow to continue chatting!`, 
        false
      );
      return;
    }
    
    setInput('');
    setIsTyping(true);

    try {
      await addMessage(trimmedInput, 'user', 'text');
      await incrementMessageCount(); // Increment the counter after successful message
      // For text messages, add a simple AI response
      const aiResponseText = "I'm here to help with your drawing! Upload an image of your artwork and I'll provide detailed feedback to help you improve your skills.";
      
      setIsTyping(false);
      await typewriterEffect(aiResponseText);
      await addMessage(aiResponseText, 'ai', 'text');
    } catch (error) {
      console.error('Error sending message:', error);
      showErrorDialog('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
      setShowTypewriter(false);
      setTypingText('');
    }
  };

  const handleUploadImage = async () => {
    if (!session || isLoadingAI || isLoadingMessages || isUploading) return;
    setShowImagePicker(true);
  };

  const handleImageSelected = async (imageUrl: string) => {
    if (!session) return;
    
    // Check rate limit before uploading image
    if (!canSendMessage) {
      showGenericDialog(
        'Daily Limit Reached', 
        `You've reached your daily limit of ${dailyMessageLimit} messages. Come back tomorrow to continue chatting!`, 
        false
      );
      return;
    }
    
    setIsTyping(true);
    try {
      await addMessage('📷 Image uploaded', 'user', 'image', imageUrl);
      await incrementMessageCount(); // Increment the counter after successful message
      
      // Update the drawing with the new image URL if it's not a daily challenge
      if (routeDrawingId && routeDrawingId !== DAILY_CHALLENGE_DRAWING_ID) {
        await updateDrawing(routeDrawingId, { image_url: imageUrl });
      }
      
      const aiResponseText = await sendDrawingForFeedback(session?.id || '', imageUrl, 'Please analyze this drawing');
      
      // If this is a daily challenge, increment the streak
      if (routeDrawingId === DAILY_CHALLENGE_DRAWING_ID) {
        await incrementStreak();
      }
      
      setIsTyping(false);
      await typewriterEffect(aiResponseText);
      await addMessage(aiResponseText, 'ai', 'feedback', imageUrl);
    } catch (error) {
      console.error('Image error:', error);
      showErrorDialog('Error', 'Failed to upload image.');
    } finally {
      setIsTyping(false);
      setShowTypewriter(false);
      setTypingText('');
    }
  };

  const handleCompare = () => {
    if (!profile?.pro_status) {
      router.push('/(tabs)/profile/upgrade');
      return;
    }
    setCompareMode((prev) => !prev);
  };

  const handleRefreshDailyChallenge = async () => {
    // Check if user can refresh the daily challenge
    if (!canRefreshChallenge) {
      showGenericDialog(
        'Daily Refresh Limit Reached', 
        'You can only refresh the daily challenge once per day. Come back tomorrow to get a new challenge!', 
        false
      );
        return;
      }

    try {
      // Increment the refresh count
      await incrementRefreshCount();
      
      // Set flag to refresh challenge when returning to home
      await AsyncStorage.setItem('shouldRefreshDailyChallenge', 'true');
      
      // Navigate back to previous screen to trigger refresh
      router.back();
    } catch (error) {
      console.error('Error refreshing daily challenge:', error);
      showErrorDialog('Error', 'Failed to refresh daily challenge. Please try again.');
    }
  };

  const handleEditName = () => {
    setNewDrawingName(routeDrawingTitle || '');
    setDialogTitle('Edit Drawing Name');
    setIsConfirmDialog(false);
    setDialogVisible(true);
    setMenuVisible(false);
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl(null);
  };

  // Render text with Markdown formatting
  const renderMarkdownText = (text: string, isUser: boolean) => {
    const textStyle = isUser ? styles.userText : styles.aiText;
    const boldStyle = isUser ? styles.userBoldText : styles.aiBoldText;
    
    // Split text by **bold** markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <Text style={textStyle}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // This is bold text
            const boldText = part.slice(2, -2);
            return (
              <Text key={index} style={boldStyle}>
                {boldText}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const submitEditName = async () => {
    if (!newDrawingName.trim()) {
      showErrorDialog('Error', 'Drawing name cannot be empty.');
      return;
    }
    if (newDrawingName === routeDrawingTitle) {
      hideDialog();
      return;
    }
    try {
      if (routeDrawingId) {
        await updateDrawing(routeDrawingId, { title: newDrawingName });
        router.setParams({ drawingTitle: newDrawingName });
      }
      hideDialog();
    } catch (error) {
      showErrorDialog('Error', 'Failed to update name.');
    }
  };

  const handleDeleteSession = async () => {
    console.log('🗑️ [ChatBot] handleDeleteSession called');
    console.log('🗑️ [ChatBot] Current session:', session);
    setMenuVisible(false);
    showGenericDialog(
      'Delete Drawing',
      'This will delete the entire drawing and all conversations. This cannot be undone.',
      true,
      async () => {
        console.log('🗑️ [ChatBot] User confirmed deletion, starting delete process...');
        try {
          // Delete everything FIRST, then navigate
          console.log('🗑️ [ChatBot] Starting deletion process...');
          
          // Delete session and messages first
          console.log('🗑️ [ChatBot] Deleting session...');
          await deleteSession();
          console.log('🗑️ [ChatBot] Session deleted successfully');
          
          // Also delete the drawing if this session was associated with one
          if (routeDrawingId) {
            console.log('🗑️ [ChatBot] Deleting associated drawing:', routeDrawingId);
            const success = await deleteDrawing(routeDrawingId);
            if (success) {
              console.log('🗑️ [ChatBot] Drawing deleted successfully');
            } else {
              console.log('🗑️ [ChatBot] Drawing deletion failed');
              throw new Error('Failed to delete drawing');
            }
          }
          
          console.log('🗑️ [ChatBot] All deletions completed, now navigating back...');
          // Only navigate after everything is deleted
          router.back();
          
        } catch (error) {
          console.error('🗑️ [ChatBot] Delete process failed:', error);
          showErrorDialog('Error', 'Failed to delete. Please try again.');
        }
      }
    );
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.sender === 'user';
    const hasImage = message.image_url;
    const isLastMessage = index === messages.length - 1;
    const isTypingMessage = isLastMessage && isTyping && !isUser;

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.aiMessage,
          { opacity: fadeAnim },
        ]}
      >
        {isTypingMessage ? (
          <TypingDots isDark={isDark} />
        ) : (
          message.text && renderMarkdownText(message.text, isUser)
        )}
        {hasImage && (
          <Pressable onPress={() => {
            console.log('🖼️ [ChatBot] Image pressed:', message.image_url);
            handleImagePress(message.image_url!);
          }}>
            <ChatImage
              imageUrl={message.image_url!}
              caption={message.message_type === 'feedback' ? 'AI Analysis' : undefined}
            />
          </Pressable>
        )}
      </Animated.View>
    );
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {routeDrawingTitle || session?.title || 'New Conversation'}
          </Text>
          {routeDrawingId !== DAILY_CHALLENGE_DRAWING_ID && (
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuButton}>
              <MoreVertical size={20} color={isDark ? '#E5E7EB' : '#111827'} />
        </TouchableOpacity>
          )}
      </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: screenWidth - 40, y: 50 }}
        >
          {routeDrawingId !== DAILY_CHALLENGE_DRAWING_ID && (
            <>
              <Menu.Item onPress={handleEditName} title="Edit Name" leadingIcon={() => <Edit size={16} color={isDark ? '#E5E7EB' : '#111827'} />} />
              <Menu.Item onPress={() => {
                console.log('🗑️ [ChatBot] Delete menu item pressed');
                handleDeleteSession();
              }} title="Delete" leadingIcon={() => <Trash2 size={16} color={isDark ? '#E5E7EB' : '#111827'} />} />
          </>
        )}
        </Menu>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.messagesContainer}
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiMessage]}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            )}
            {showTypewriter && (
              <View style={[styles.messageBubble, styles.aiMessage]}>
                <Text style={styles.aiText}>{typingText}</Text>
        </View>
            )}
      </ScrollView>

          <View style={styles.inputContainer}>
            {/* Rate limit indicator */}
            <View style={styles.rateLimitContainer}>
              <Text style={styles.rateLimitText}>
                Messages today: {dailyMessageCount}/{dailyMessageLimit}
              </Text>
              {!canSendMessage && (
                <Text style={styles.rateLimitWarning}>
                  Daily limit reached. Come back tomorrow!
                </Text>
              )}
            </View>
            
            <TextInput
              style={[
                styles.textInput,
                !canSendMessage && styles.disabledInput
              ]}
              placeholder={canSendMessage ? "Ask me about your drawing..." : "Daily limit reached"}
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={input}
              onChangeText={setInput}
              editable={!isLoadingAI && !isLoadingMessages && !isUploading && canSendMessage}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            
            <View style={styles.inputRow}>
              <View style={styles.leftButtons}>
                <TouchableOpacity
                  onPress={handleUploadImage}
                  disabled={isLoadingAI || isLoadingMessages || isUploading || !canSendMessage}
                  style={[
                    styles.actionButton,
                    (!canSendMessage) && styles.disabledButton
                  ]}
                >
                  <Plus size={24} color={isDark ? '#E5E7EB' : '#111827'} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!input.trim() || isLoadingAI || isLoadingMessages || isUploading || !canSendMessage}
                style={[
                  styles.actionButton,
                  (!canSendMessage) && styles.disabledButton
                ]}
              >
                <ArrowUp size={24} color={isDark ? '#E5E7EB' : '#111827'} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
            <Dialog.Content>
              {isConfirmDialog ? (
                <Text style={styles.dialogText}>{dialogMessage}</Text>
              ) : (
                <TextInput
                  value={newDrawingName}
                  onChangeText={setNewDrawingName}
                  placeholder="Enter new name"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  style={styles.dialogInput}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              {isConfirmDialog ? (
                <>
                  <Button 
                    onPress={hideDialog}
                    textColor={isDark ? '#E5E7EB' : '#374151'}
                    style={styles.dialogButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={executeDialogCallback}
                    textColor="#EF4444"
                    style={styles.dialogButton}
                  >
                    Delete
                  </Button>
                </>
              ) : dialogTitle === 'Error' ? (
                <Button 
                  onPress={hideDialog}
                  textColor={isDark ? '#E5E7EB' : '#374151'}
                  style={styles.dialogButton}
                >
                  OK
                </Button>
              ) : (
                <>
                  <Button 
                    onPress={hideDialog}
                    textColor={isDark ? '#E5E7EB' : '#374151'}
                    style={styles.dialogButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={submitEditName}
                    textColor="#7C3AED"
                    style={styles.dialogButton}
                  >
                    Save
                  </Button>
                </>
              )}
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <ImagePickerModal
          visible={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onImageSelected={handleImageSelected}
          title="Upload Drawing"
        />

        {/* Image Modal for viewing full-size images */}
        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={closeImageModal}
        >
          <View style={styles.imageModalOverlay}>
            <Pressable style={styles.imageModalContainer} onPress={closeImageModal}>
              <View style={styles.imageModalContent}>
                {selectedImageUrl && (
                  <Image
                    source={{ uri: selectedImageUrl }}
                    style={styles.fullSizeImage}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  style={styles.closeImageButton}
                  onPress={closeImageModal}
                >
                  <Text style={styles.closeImageButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Modal>
      </SafeAreaView>
    </Provider>
  );
};

const createStyles = (isDark: boolean, windowWidth?: number) => {
  return StyleSheet.create({
  container: {
    flex: 1,
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
  },
  backButton: {
      padding: 6,
  },
  headerTitle: {
      flex: 1,
      marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
  },
    menuButton: {
      padding: 6,
  },
    messagesContainer: {
    flex: 1,
      paddingHorizontal: Platform.OS === 'web' ? 52 : 12,
    },
    messagesContentContainer: {
      paddingVertical: 12,
      paddingBottom: 120,
    },
    messageBubble: {
      marginBottom: 32,
      padding: 12,
      borderRadius: 14,
    },
    userMessage: {
      backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 0,
      maxWidth: '85%',
    },
    aiMessage: {
      backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
      borderBottomLeftRadius: 0,
      alignSelf: 'center',
      width: '100%',
    },
    userText: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 16,
      lineHeight: 22,
    },
    aiText: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'left',
    },
    userBoldText: {
      fontWeight: 'bold',
    },
    aiBoldText: {
      fontWeight: 'bold',
    },
    inputContainer: {
      padding: 16,
      marginTop: 16,
      marginHorizontal: Platform.OS === 'web' ? 40 : 16,
      marginBottom: 16,
      backgroundColor: isDark ? '#1A1A1A' : '#F8F9FA',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#2C2C2C' : '#E5E7EB',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2C' : '#E5E7EB',
    },
    textInput: {
      minHeight: 50,
      maxHeight: 120,
      fontSize: 16,
      color: isDark ? '#E5E7EB' : '#111827',
      paddingHorizontal: 4,
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: 'transparent',
    marginBottom: 12,
      textAlignVertical: 'center',
  },
    inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
      paddingHorizontal: 0,
    },
    leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
      gap: 12,
    },
    actionButton: {
      padding: 12,
      backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
      borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
      height: 50,
      minWidth: 50,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#D1D5DB',
    },
    actionButtonActive: {
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    compareText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
      fontSize: 14,
    },
    compareTextActive: {
      color: isDark ? '#E5E7EB' : '#111827',
    },
    dialog: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      overflow: 'hidden', // Ensures child components respect the border radius
    },
    dialogTitle: {
    color: isDark ? '#E5E7EB' : '#111827',
      fontSize: 18,
      fontWeight: '600',
    },
    dialogText: {
      color: isDark ? '#E5E7EB' : '#111827',
      fontSize: 16,
      lineHeight: 22,
    },
    dialogActions: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      paddingHorizontal: 8,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      marginTop: 0,
    },
    dialogButton: {
      marginHorizontal: 4,
    },
    dialogInput: {
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#D1D5DB',
      color: isDark ? '#E5E7EB' : '#111827',
      paddingVertical: 8,
    },
    rateLimitContainer: {
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    rateLimitText: {
      fontSize: 12,
      color: isDark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
    },
    rateLimitWarning: {
      fontSize: 12,
    color: '#EF4444',
      textAlign: 'center',
      fontWeight: '600',
      marginTop: 2,
  },
    disabledInput: {
      opacity: 0.5,
  },
    disabledButton: {
      opacity: 0.5,
  },
    // Image Modal Styles
    imageModalOverlay: {
    flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
    imageModalContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageModalContent: {
      position: 'relative',
      width: '90%',
      height: '80%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullSizeImage: {
      width: '100%',
      height: '100%',
    },
    closeImageButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeImageButtonText: {
    color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
  },
  });
};

export default ChatBot;