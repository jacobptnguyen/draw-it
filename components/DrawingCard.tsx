import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Image, TextInput, Platform, Modal, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Provider, Portal, Dialog, Button, Menu } from 'react-native-paper';
import { MoreVertical, Edit, Trash2, Flame } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Drawing, DrawingCardProps } from '@/types';

// Reusable function to get platform-specific shadow styles
const getShadowStyles = (isDark: boolean) => {
  const shadowOpacity = isDark ? 0.3 : 0.1;
  
  return {
    boxShadow: `0px 2px 8px rgba(0, 0, 0, ${shadowOpacity})`,
  };
};

export function DrawingCard({ drawing, isFirst = false, style, onPress, onDelete, onEditName, currentStreak, isStreakSafe }: DrawingCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const isWeb = Platform.OS === 'web';

  // Set document body background color on web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#121212' : '#F9FAFB';
    }
  }, [isDark, isWeb]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isConfirmDialog, setIsConfirmDialog] = useState(false);
  const [dialogCallback, setDialogCallback] = useState<(() => void) | null>(null);
  const [newDrawingName, setNewDrawingName] = useState(drawing.title);
  const [showImageModal, setShowImageModal] = useState(false);

  const showGenericDialog = (title: string, message: string, isConfirm: boolean, callback?: () => void) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsConfirmDialog(isConfirm);
    setDialogCallback(() => callback ?? null);
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

  const handleImagePress = () => {
    if (drawing.image_url) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };


  const submitEditName = async () => {
    if (newDrawingName.trim() === '') {
      showGenericDialog('Error', 'Drawing name cannot be empty.', false);
      return;
    }
    if (newDrawingName === drawing.title) {
      hideDialog();
      return;
    }
    try {
      const { error } = await supabase
        .from('drawings')
        .update({ title: newDrawingName, updated_at: new Date().toISOString() })
        .eq('id', drawing.id);

      if (error) throw error;

      if (onEditName) {
        onEditName(drawing.id, newDrawingName);
      }
      hideDialog();
    } catch (error) {
      console.error('Error updating drawing name:', error);
      showGenericDialog('Error', 'Failed to update drawing name. Please try again.', false);
    }
  };

  const getThumbnailContent = () => {
    if (drawing.image_url) {
      return (
        <Image
          source={{ uri: drawing.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    if (isFirst) {
      return <Text style={styles.imagePlaceholder}>📅</Text>;
    } else {
      return <Text style={styles.imagePlaceholder}>🎨</Text>;
    }
  };

  const getCardTitle = () => {
    if (isFirst) {
      return `Daily Challenge: ${drawing.title}`;
    }
    return drawing.title;
  };

  const getCardSubtitle = () => {
    if (isFirst && drawing.prompt) {
      return drawing.prompt;
    }
    if (drawing.ai_feedback) {
      return drawing.ai_feedback;
    }
    return `Created ${formatDistanceToNow(new Date(drawing.created_at), { addSuffix: true })}`;
  };



  return (
    <Provider>
      <TouchableOpacity
        style={[styles.card, getShadowStyles(isDark), style]}
        onPress={() => {
          console.log('🎨 [DRAWINGCARD] Card pressed:', {
            drawingId: drawing.id,
            drawingTitle: drawing.title,
            onPress: !!onPress
          });
          if (onPress) {
            onPress();
          } else {
            console.error('🎨 [DRAWINGCARD] No onPress handler provided!');
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open drawing ${getCardTitle()}`}
      >
        <View style={styles.imageArea}>
          {getThumbnailContent()}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {getCardTitle()}
            </Text>
            {drawing.ai_score !== undefined && drawing.ai_score !== null && (
              <View style={styles.aiScoreBadge}>
                <Text style={styles.aiScoreText}>{drawing.ai_score}/100</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {isFirst && isStreakSafe !== undefined 
              ? (isStreakSafe ? 'Streak safe!' : 'Upload a picture to maintain your streak!')
              : getCardSubtitle()
            }
          </Text>

          {isFirst && currentStreak !== undefined && (
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Flame size={24} {...({ color: "#F97316", fill: "#F97316" } as any)} />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>Current Streak</Text>
                <Text style={styles.streakCount}>{currentStreak} days</Text>
              </View>
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>
              {formatDistanceToNow(new Date(drawing.created_at), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog} style={styles.dialog}>
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            {dialogTitle === 'Edit Drawing Name' ? (
              <TextInput
                style={styles.textInput}
                value={newDrawingName}
                onChangeText={setNewDrawingName}
                placeholder="Enter new drawing name"
                autoFocus
                accessibilityLabel="New drawing name input"
              />
            ) : (
              <Text>{dialogMessage}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            {isConfirmDialog && (
              <Button onPress={executeDialogCallback} mode="contained" style={styles.dialogConfirmButton}>
                Confirm
              </Button>
            )}
            {dialogTitle === 'Edit Drawing Name' && (
              <Button onPress={submitEditName} mode="contained" style={styles.dialogConfirmButton}>
                Save
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
              {drawing.image_url && (
                <Image
                  source={{ uri: drawing.image_url }}
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
    </Provider>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
      marginBottom: 64,
      overflow: 'hidden',
    },
    imageArea: {
      width: '100%',
      aspectRatio: Platform.OS === 'web' ? 3 / 1 : 2.5 / 1,
      maxHeight: Platform.OS === 'web' ? 200 : undefined,
      backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      fontSize: 48,
      opacity: 0.6,
    },
    cardContent: {
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
      flex: 1,
      marginRight: 12,
    },
    aiScoreBadge: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
    aiScoreText: {
      color: '#15803D',
      fontWeight: '600',
      fontSize: 12,
    },
    cardSubtitle: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      lineHeight: 18,
      marginBottom: 12,
    },
    streakCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      marginHorizontal: -4,
      boxShadow: `0px 2px 8px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
    },
    streakIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#1E293B' : '#FFEDD5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    streakInfo: {
      flex: 1,
    },
    streakTitle: {
      fontSize: 14,
      color: isDark ? '#9CA3AF' : '#6B7280',
      marginBottom: 4,
    },
    streakCount: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#F3F4F6' : '#111827',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: isDark ? '#737373' : '#9CA3AF',
    },
    textInput: {
      borderWidth: 1,
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 8,
      padding: 12,
      color: isDark ? '#E5E7EB' : '#111827',
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
    },
    dialog: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    },
    dialogConfirmButton: {
      backgroundColor: isDark ? '#7C3AED' : '#9333EA',
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
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });
}
