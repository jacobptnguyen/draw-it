import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';

type PermissionState = 'undetermined' | 'granted' | 'denied' | 'limited';

export const useImagePicker = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');

  const checkPermissionStatus = async (): Promise<PermissionState> => {
    if (Platform.OS === 'web') {
      setPermissionState('granted');
      return 'granted';
    }

    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    setPermissionState(status as PermissionState);
    return status as PermissionState;
  };

  const showCustomPermissionDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        const result = window.confirm('Allow Photo Access\n\nThis lets you share images from your photo library.\n\nClick OK to select photos, or Cancel to keep current selection.');
        console.log(result ? '✅ User chose to select photos' : '❌ User chose to keep current selection');
        resolve(result);
      } else {
        Alert.alert(
          'Allow Photo Access',
          'This lets you share images from your photo library.',
          [
            {
              text: 'Keep Current Selection',
              style: 'cancel',
              onPress: () => {
                console.log('❌ User chose to keep current selection');
                resolve(false);
              },
            },
            {
              text: 'Select Photos',
              onPress: () => {
                console.log('✅ User chose to select photos');
                resolve(true);
              },
            },
          ],
          { cancelable: false }
        );
      }
    });
  };

  const showPermissionDeniedDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        window.alert('Photo Access Denied\n\nTo share photos, please enable photo library access in your device settings.');
        resolve(false);
      } else {
        Alert.alert(
          'Photo Access Denied',
          'To share photos, please enable photo library access in your device settings.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                // Note: Opening settings programmatically requires additional setup
                resolve(false);
              },
            },
          ]
        );
      }
    });
  };

  const requestPhotoAccess = async (): Promise<boolean> => {
    console.log('🔍 Checking photo permission status...');
    const currentStatus = await checkPermissionStatus();
    console.log('📱 Current permission status:', currentStatus);
    
    switch (currentStatus) {
      case 'granted':
        console.log('✅ Permission already granted');
        return true;
        
      case 'undetermined':
        console.log('❓ Permission undetermined, showing custom dialog...');
        // First show custom dialog
        const userWantsPhotos = await showCustomPermissionDialog();
        
        if (!userWantsPhotos) {
          console.log('❌ User declined photo access');
          return false;
        }
        
        console.log('🔐 Requesting system permission...');
        // Then request system permission
        try {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          const granted = status === ImagePicker.PermissionStatus.GRANTED;
          setPermissionState(status as PermissionState);
          console.log('📝 System permission result:', status, '| Granted:', granted);
          return granted;
        } catch (error) {
          console.error('❌ Permission request failed:', error);
          return false;
        }
        
      case 'denied':
        console.log('🚫 Permission previously denied, showing settings dialog...');
        return await showPermissionDeniedDialog();
        
      case 'limited':
        console.log('🔒 Limited access granted (iOS 14+)');
        return true;
        
      default:
        return false;
    }
  };

  const requestCameraAccess = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;
    
    console.log('📷 Requesting camera permission...');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const granted = status === ImagePicker.PermissionStatus.GRANTED;
    
    if (!granted) {
      if (Platform.OS === 'web') {
        window.alert('Camera Access Needed\n\nPlease allow camera access to take photos.');
      } else {
        Alert.alert(
          'Camera Access Needed',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
      }
    }
    
    console.log('📷 Camera permission result:', status);
    return granted;
  };

  const deletePreviousImage = async (imageUrl: string): Promise<void> => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `user-images/${fileName}`;

      const { error } = await supabase.storage
        .from('drawings')
        .remove([filePath]);

      if (error) {
        console.warn('Failed to delete previous image:', error);
      }
    } catch (error) {
      console.warn('Error deleting previous image:', error);
    }
  };

  const uploadImage = async (uri: string, previousImageUrl?: string): Promise<string> => {
    setIsUploading(true);
    try {
      if (previousImageUrl) {
        await deletePreviousImage(previousImageUrl);
      }

      const file = new File(uri);
      const arrayBuffer = await file.arrayBuffer();
      
      const fileName = `user-images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('drawings')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('drawings')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const pickFromLibrary = async (previousImageUrl?: string): Promise<string | null> => {
    const hasAccess = await requestPhotoAccess();
    if (!hasAccess) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        return await uploadImage(result.assets[0].uri, previousImageUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to select image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      }
    }
    return null;
  };

  const takePhoto = async (previousImageUrl?: string): Promise<string | null> => {
    const hasAccess = await requestCameraAccess();
    if (!hasAccess) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return await uploadImage(result.assets[0].uri, previousImageUrl);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to take photo. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
    return null;
  };

  const showImagePickerOptions = (previousImageUrl?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'web') {
        // On web, default to photo library since camera access is limited
        const result = pickFromLibrary(previousImageUrl);
        resolve(result);
      } else {
        Alert.alert(
          'Add Image',
          'Choose how you want to add an image',
          [
            {
              text: 'Camera',
              onPress: async () => {
                const result = await takePhoto(previousImageUrl);
                resolve(result);
              },
            },
            {
              text: 'Photo Library',
              onPress: async () => {
                const result = await pickFromLibrary(previousImageUrl);
                resolve(result);
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      }
    });
  };

  const canAccessPhotos = async (): Promise<boolean> => {
    const status = await checkPermissionStatus();
    return status === 'granted' || status === 'limited';
  };

  return {
    takePhoto,
    pickFromLibrary,
    showImagePickerOptions,
    uploadImage,
    deletePreviousImage,
    isUploading,
    permissionState,
    canAccessPhotos,
    requestPhotoAccess,
    requestCameraAccess, // Added this for the modal to use
  };
};