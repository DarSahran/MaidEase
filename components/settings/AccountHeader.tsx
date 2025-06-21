import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getUser } from '../../utils/session';

export default function AccountHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, []);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'User'
    : 'User';

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.accountLabel}>Account</Text>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.manageText}>{user?.email || 'Manage Account'}</Text>
      </View>
      <Image
        source={require('@/assets/images/profile-avatar.png')}
        style={styles.avatar}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  accountLabel: {
    fontSize: 15,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 21,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '700',
    color: '#141414',
    lineHeight: 20,
  },
  manageText: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '400',
    color: '#737373',
    lineHeight: 21,
  },
  avatar: {
    width: 130,
    height: 70,
    borderRadius: 12,
  },
});
