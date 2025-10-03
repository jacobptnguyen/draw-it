import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useImagePicker } from '@/hooks/useImagePicker';

interface ProfilePicturePickerProps {
  visible: boolean;
  onClose: () => void;
}

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  visible,
  onClose,
}) => {
  const { user: authUser } = useAuth();
  const { updateProfile } = useProfile(authUser?.id);
  const { requestPhotoAccess, isUploading } = useImagePicker();
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('Camera Access Needed\n\nPlease allow camera access to take photos.');
      } else {
        Alert.alert(
          'Camera Access Needed',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
      }
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    try {

      // Resize and crop the image to a square
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 400, height: 400 } }
        ],
        { 
          compress: 0.8, 
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Upload to Supabase Storage using the new File API
      const fileName = `${authUser?.id}/${Date.now()}.jpg`;
      
      // Use the new File API
      const file = new File(manipResult.uri);
      const arrayBuffer = await file.arrayBuffer();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update the user's profile
      const result = await updateProfile({ profile_picture_url: publicUrl });
      
      if (result?.error) {
        throw new Error(result.error);
      }

      if (Platform.OS === 'web') {
        window.alert('Success: Profile picture updated successfully!');
      } else {
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error updating profile picture:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to update profile picture. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    } finally {
      // Uploading state is managed by the useImagePicker hook
    }
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to take photo');
      } else {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const pickImageFromGallery = async () => {
    const hasAccess = await requestPhotoAccess();
    if (!hasAccess) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
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
            <Text style={styles.modalTitle}>Update Profile Picture</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#E5E7EB' : '#111827'} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.option}
                onPress={pickImageFromCamera}
                disabled={isUploading}
              >
                <View style={styles.optionIcon}>
                  <Camera size={32} color={isDark ? '#E5E7EB' : '#111827'} />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.option, Platform.OS === 'web' && styles.optionFullWidth]}
              onPress={pickImageFromGallery}
              disabled={isUploading}
            >
              <View style={styles.optionIcon}>
                <ImageIcon size={32} color={isDark ? '#E5E7EB' : '#111827'} />
              </View>
              <Text style={styles.optionText}>
                {Platform.OS === 'web' ? 'Upload Photo' : 'Choose from Gallery'}
              </Text>
            </TouchableOpacity>
          </View>

          {isUploading && (
            <Text style={styles.uploadingText}>Uploading...</Text>
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
  uploadingText: {
    marginTop: 16,
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
  },
  });
};

export default ProfilePicturePicker;