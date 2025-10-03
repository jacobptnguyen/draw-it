import React from 'react'
import { View, StyleSheet, Text, ViewStyle } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'

interface ProfilePictureProps {
  size: number
  imageUrl?: string
  style?: ViewStyle
}

export function ProfilePicture({ size, imageUrl, style }: ProfilePictureProps) {
  const dynamicStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
  }

  if (imageUrl) {
    return <View style={[styles.placeholder, dynamicStyles, style]} />
  }

  return (
    <View style={[styles.placeholder, dynamicStyles, style]}>
      <FontAwesome 
        name="user" 
        size={size * 0.5} 
        color="#666" 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
})