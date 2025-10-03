import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useImagePicker } from '@/hooks/useImagePicker';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
  title?: string;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = "Select Image",
}) => {
  const { requestPhotoAccess, requestCameraAccess, uploadImage } = useImagePicker();
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const processAndUploadImage = async (uri: string) => {
    try {
      setIsProcessing(true);
      console.log('📸 [ImagePickerModal] Processing image:', uri);
      
      // Resize the image for better performance
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1024 } } // Resize to max width 1024px, maintains aspect ratio
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      console.log('✅ [ImagePickerModal] Image processed, uploading..');
      
      // Upload to Supabase and get the public URL
      const publicUrl = await uploadImage(manipResult.uri);
      
      console.log('✅ [ImagePickerModal] Image uploaded successfully:', publicUrl);
      
      // Call the callback with the Supabase public URL (not the local URI)
      onImageSelected(publicUrl);
      onClose();
    } catch (error) {
      console.error('❌ [ImagePickerModal] Error processing/uploading image:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to process and upload image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to process and upload image. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImageFromCamera = async () => {
    console.log('📷 Camera button pressed');
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) {
      console.log('❌ Camera permission denied');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to take photo');
      } else {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const pickImageFromGallery = async () => {
    console.log('🚀 Starting gallery picker...');
    
    // This will show the Discord-style permission dialog
    const hasAccess = await requestPhotoAccess();
    console.log('📱 Permission result:', hasAccess);
    
    // FIX: Actually check the result and return if no access
    if (!hasAccess) {
      console.log('❌ Photo access denied by user');
      return;
    }

    console.log('✅ Permission granted, opening gallery...');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Gallery picker error:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to pick image');
      } else {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isProcessing}>
              <X size={24} color={isDark ? '#E5E7EB' : '#111827'} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {!isWeb && (
              <TouchableOpacity
                style={styles.option}
                onPress={pickImageFromCamera}
                disabled={isProcessing}
              >
                <View style={styles.optionIcon}>
                  <Camera size={32} color={isDark ? '#E5E7EB' : '#111827'} />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.option, isWeb && styles.optionFullWidth]}
              onPress={pickImageFromGallery}
              disabled={isProcessing}
            >
              <View style={styles.optionIcon}>
                <ImageIcon size={32} color={isDark ? '#E5E7EB' : '#111827'} />
              </View>
              <Text style={styles.optionText}>
                {isWeb ? 'Upload Photo' : 'Choose from Gallery'}
              </Text>
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={isDark ? '#E5E7EB' : '#111827'} />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (isDark: boolean) => {
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
      elevation: 5,
      minWidth: isWeb ? 400 : 300,
      maxWidth: isWeb ? 500 : undefined,
    },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  option: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
    flex: 1,
  },
  optionFullWidth: {
    flex: 1,
    minWidth: '100%',
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#E5E7EB' : '#111827',
    textAlign: 'center',
  },
  uploadingContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
    fontWeight: '500',
  },
  });
};

export default ImagePickerModal;
