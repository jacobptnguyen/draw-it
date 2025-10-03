import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

interface ChatImageProps {
  imageUrl: string;
  caption?: string;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

export const ChatImage: React.FC<ChatImageProps> = ({ imageUrl, caption, style }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const isWeb = Platform.OS === 'web';

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleImageError = () => {
    console.warn('Failed to load image:', imageUrl);
    setImageError(true);
  };

  return (
    <>
      <TouchableOpacity onPress={openModal} style={[styles.imageContainer, style]}>
        {imageError ? (
          <View style={[styles.image, styles.errorContainer]}>
            <Text style={styles.errorText}>Failed to load image</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
            // Web-specific props for better compatibility
            {...(isWeb && {
              crossOrigin: 'anonymous',
              referrerPolicy: 'no-referrer'
            })}
          />
        )}
        {caption && !imageError && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="white" />
                </TouchableOpacity>
                
                {imageError ? (
                  <View style={[styles.modalImage, styles.errorContainer]}>
                    <Text style={styles.errorText}>Failed to load image</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onError={handleImageError}
                    // Web-specific props for better compatibility
                    {...(isWeb && {
                      crossOrigin: 'anonymous',
                      referrerPolicy: 'no-referrer'
                    })}
                  />
                )}
                
                {caption && (
                  <View style={styles.modalCaptionContainer}>
                    <Text style={styles.modalCaptionText}>{caption}</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    imageContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 12,
      marginBottom: 12,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    captionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8,
    },
    captionText: {
      color: 'white',
      fontSize: 12,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: screenWidth * 0.9,
      height: screenHeight * 0.8,
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    modalImage: {
      width: '100%',
      height: '100%',
    },
    modalCaptionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalCaptionText: {
      color: isDark ? '#E5E7EB' : '#1F2937',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    errorContainer: {
      backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#D1D5DB',
      borderStyle: 'dashed',
    },
    errorText: {
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
  });
};
