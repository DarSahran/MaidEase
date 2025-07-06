import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';

const updateImages: any[] = [];
try {
  updateImages.push(require('@/assets/updates/update1.png'));
} catch {}
try {
  updateImages.push(require('@/assets/updates/update2.png'));
} catch {}
try {
  updateImages.push(require('@/assets/updates/update3.png'));
} catch {}
if (updateImages.length === 0) {
  updateImages.push(require('@/assets/images/brooming-illustration.png'));
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PADDING = 16;
const IMAGE_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
const IMAGE_GAP = 16;

export default function UpdatesCarousel() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const isCarousel = updateImages.length > 1;

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % updateImages.length);
    }, 4000); // 6 seconds for slower transition
    return () => clearInterval(interval);
  }, [isCarousel]);

  useEffect(() => {
    if (carouselRef.current && isCarousel) {
      carouselRef.current.scrollToIndex({ index: carouselIndex, animated: true });
    }
  }, [carouselIndex, isCarousel]);

  if (!updateImages.length) return null;

  if (!isCarousel) {
    // Only one image, just show it
    return (
      <View style={styles.carouselWrapper}>
        <Image source={updateImages[0]} style={styles.carouselImage} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={carouselRef}
        data={updateImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: IMAGE_WIDTH, alignItems: 'center' }}>
            <Image source={item} style={styles.carouselImage} resizeMode="cover" />
          </View>
        )}
        keyExtractor={(_, idx) => idx.toString()}
        style={styles.carousel}
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
        ItemSeparatorComponent={() => <View style={{ width: IMAGE_GAP }} />}
        getItemLayout={(_, index) => ({ length: IMAGE_WIDTH + IMAGE_GAP, offset: (IMAGE_WIDTH + IMAGE_GAP) * index, index })}
        initialScrollIndex={0}
        extraData={carouselIndex}
        snapToInterval={IMAGE_WIDTH + IMAGE_GAP}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    marginTop: 20,
    marginBottom: 8,
  },
  carousel: {
    width: SCREEN_WIDTH,
    height: 180,
  },
  carouselImage: {
    width: IMAGE_WIDTH,
    height: 180,
    borderRadius: 25,
    backgroundColor: '#F7FCF7',
  },
});
