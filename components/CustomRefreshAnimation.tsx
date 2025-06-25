import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function CustomRefreshAnimation() {
  React.useEffect(() => {
    // This effect is just for demonstration; you should call Updates.reloadAsync() in your refresh handler
  }, []);
  return (
    <View style={styles.container}>
      {/* Try/catch fallback for asset loading */}
      <Image
        source={require('../assets/refresh.gif')}
        style={styles.image}
        resizeMode="contain"
        onError={() => console.warn('Could not load refresh.gif from assets folder')}
      />
      {/* Optional fallback text for debugging */}
      {/* <Text style={{color: 'red'}}>If you see this, the GIF did not load.</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  image: {
    width: 60,
    height: 60,
  },
});
