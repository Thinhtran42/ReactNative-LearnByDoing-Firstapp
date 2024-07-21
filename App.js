import { useState, useRef, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Platform, Dimensions } from 'react-native'
import ImageViewer from './components/ImageViewer'
import Button from './components/Button'
import * as ImagePicker from 'expo-image-picker'
import IconButton from './components/IconButton'
import CircleButton from './components/CircleButton'
import EmojiPicker from './components/EmojiPicker'
import EmojiList from './components/EmojiList'
import EmojiSticker from './components/EmojiSticker'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'
import domtoimage from 'dom-to-image'

const PlaceholderImage = require('./assets/images/background-image.png')

export default function App() {
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Dimensions.get('window').width < 768)
    }

    // Lắng nghe sự thay đổi kích thước màn hình
    const subscription = Dimensions.addEventListener('change', handleResize)

    // Dọn dẹp khi component bị hủy
    return () => {
      subscription?.remove()
    }
  }, [])

  // state
  const [selectedImage, setSelectedImage] = useState(null)
  const [showAppButton, setShowAppButton] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pickedEmoji, setPickedEmoji] = useState(null)

  const imageRef = useRef()

  // for permission to use Media Library
  const [status, requestPermission] = MediaLibrary.usePermissions()

  if (status === null) {
    requestPermission()
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      console.log(result)
      setSelectedImage(result.assets[0].uri)
      setShowAppButton(true)
    } else {
      alert('You did not select any image.')
    }
  }

  const onReset = () => {
    setShowAppButton(false)
  }

  const onAddSticker = () => {
    setIsModalVisible(true)
  }

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        })

        await MediaLibrary.saveToLibraryAsync(localUri)
        if (localUri) {
          alert('Saved Screenshot to Gallery')
        }
      } catch (e) {
        console.log(e)
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        })

        let link = document.createElement('a')
        link.download = 'sticker-smash.jpeg'
        link.href = dataUrl
        link.click()
      } catch (e) {
        console.log(e)
      }
    }
  }

  const onModalClose = () => {
    setIsModalVisible(false)
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View
          ref={imageRef}
          collapsable={false}
        >
          <ImageViewer
            placeholderImageSource={PlaceholderImage}
            selectedImage={selectedImage}
          />

          {pickedEmoji && (
            <EmojiSticker
              imageSize={40}
              stickerSource={pickedEmoji}
            />
          )}
        </View>
      </View>
      {showAppButton ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton
              icon='refresh'
              label='Reset'
              onPress={onReset}
            />
            <CircleButton onPress={onAddSticker} />
            <IconButton
              icon='save-alt'
              label='Save'
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View
          style={isMobile ? styles.footerContainer : styles.footerContainerRow}
        >
          <Button
            theme={'primary'}
            label={'Choose a photo'}
            onPress={pickImageAsync}
          ></Button>
          <Button
            label={'Use this photo'}
            onPress={() => setShowAppButton(true)}
          ></Button>
        </View>
      )}

      <EmojiPicker
        isVisible={isModalVisible}
        onClose={onModalClose}
      >
        <EmojiList
          onSelect={setPickedEmoji}
          onCloseModal={onModalClose}
        />
      </EmojiPicker>

      <StatusBar style='auto' />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 80,
  },
  footerContainer: {
    flex: 1 / 3,
    flexDirection: 'col',
    alignItems: 'center',
  },
  footerContainerRow: {
    flexDirection: 'row',
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})
