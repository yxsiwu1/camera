import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, fonts } from '../constants/theme';

export default function MissingRoute() {
  return <View style={styles.container}><Text style={styles.mark}>Drama相机</Text><Text style={styles.title}>这一页还在显影中</Text><Text style={styles.body}>回到相机，继续找一束适合你的光。</Text><Link href="/(tabs)/camera" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>回到相机</Text></Pressable></Link></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 24 },
  mark: { color: colors.primary, fontFamily: fonts.display, fontSize: 35 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 24, marginTop: 25 },
  body: { color: colors.muted, fontSize: 13, marginTop: 9 },
  button: { backgroundColor: colors.primary, borderRadius: 22, paddingVertical: 13, paddingHorizontal: 25, marginTop: 24 },
  buttonText: { color: colors.whiteWarm, fontWeight: '700' },
});
