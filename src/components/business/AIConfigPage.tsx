import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { AI_PROVIDER_IDS, AI_PROVIDERS } from '../../constants/ai';
import { useAIConfig } from '../../hooks/useAIConfig';

export function AIConfigPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, loading, loadFailed, busy, notice, dirty, load, selectProvider, update, run } = useAIConfig();
  const [showKey, setShowKey] = useState(false);
  const provider = settings.provider;
  const profile = settings.profiles[provider];
  const disabled = loading || loadFailed || !!busy;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="返回我的" hitSlop={8}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
            style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <Text style={styles.title}>AI 配置</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}><Ionicons name="options-outline" size={26} color={colors.primary} /></View>
          <Text style={styles.headline}>连接你的摄影助手</Text>
          <Text style={styles.description}>选择 AI 服务，填写自己的 API Key。{ '\n' }保存后，在取景器中开启 AI 拍摄指导。</Text>
        </View>

        <Text style={styles.sectionLabel}>服务商</Text>
        <View style={styles.providers}>
          {AI_PROVIDER_IDS.map(id => (
            <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: provider === id, disabled }}
              disabled={disabled} onPress={() => { selectProvider(id); setShowKey(false); }}
              style={[styles.provider, id === 'custom' && styles.customProvider, provider === id && styles.providerSelected]}>
              <View style={styles.providerTop}>
                <Text style={styles.providerName}>{AI_PROVIDERS[id].name}</Text>
                <Ionicons name={provider === id ? 'checkmark-circle' : 'ellipse-outline'} size={20}
                  color={provider === id ? colors.primary : colors.line} />
              </View>
              <Text style={styles.providerHint}>{AI_PROVIDERS[id].hint}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? <ActivityIndicator style={styles.loading} color={colors.primary} accessibilityLabel="正在读取配置" /> : (
          <View style={styles.form}>
            <View style={styles.formHeading}>
              <Text style={styles.sectionLabel}>连接设置</Text>
              <Text style={styles.draft}>{dirty ? '有未保存的修改' : '本机配置'}</Text>
            </View>

            <Text style={styles.label}>API Key</Text>
            <View style={styles.keyRow}>
              <TextInput accessibilityLabel="API Key" value={profile.apiKey} editable={!disabled}
                onChangeText={value => update('apiKey', value)} secureTextEntry={!showKey}
                autoCapitalize="none" autoCorrect={false} autoComplete="off" textContentType="none"
                placeholder="粘贴你的 API Key" placeholderTextColor={colors.subtle}
                style={[styles.input, styles.keyInput]} />
              <Pressable accessibilityRole="button" accessibilityLabel={showKey ? '隐藏密钥' : '显示密钥'}
                onPress={() => setShowKey(value => !value)} style={styles.eye}>
                <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={styles.help}>{Platform.OS === 'web'
              ? '网页版密钥仅在当前页面会话中保留，刷新或关闭后需重新填写。'
              : '密钥保存在本机系统安全存储中，仅在请求时发送给你配置的 API 服务。'}</Text>

            <Text style={styles.label}>API 地址</Text>
            <TextInput accessibilityLabel="API 地址" value={profile.baseUrl} editable={!disabled}
              onChangeText={value => update('baseUrl', value)} autoCapitalize="none" autoCorrect={false}
              keyboardType="url" placeholder={provider === 'custom' ? 'https://your-api.example/v1' : AI_PROVIDERS[provider].baseUrl} placeholderTextColor={colors.subtle} style={styles.input} />
            <Text style={styles.help}>{provider === 'custom'
              ? '支持 OpenAI 兼容接口。填写 HTTPS 基础地址（保留服务要求的 /v1 等路径），无需添加 /chat/completions。'
              : '填写基础地址，无需添加 /chat/completions。请使用你信任的服务地址。'}</Text>

            <Text style={styles.label}>模型名称</Text>
            <TextInput accessibilityLabel="模型名称" value={profile.model} editable={!disabled}
              onChangeText={value => update('model', value)} autoCapitalize="none" autoCorrect={false}
              placeholder={provider === 'custom' ? '填写服务商提供的模型 ID' : AI_PROVIDERS[provider].model} placeholderTextColor={colors.subtle} style={styles.input} />
            <Text style={styles.help}>{provider === 'custom'
              ? '拍摄指导需要模型支持图片输入，且接口支持 JSON Schema 结构化输出。测试连接仅验证文本请求。'
              : '默认填入支持图片的模型；可按账号开通情况修改。'}</Text>
            {provider !== 'custom' && <Pressable accessibilityRole="button" disabled={disabled} onPress={() => {
              update('baseUrl', AI_PROVIDERS[provider].baseUrl);
              update('model', AI_PROVIDERS[provider].model);
            }} style={styles.textAction}>
              <Text style={styles.link}>恢复默认地址与模型</Text>
            </Pressable>}
          </View>
        )}

        {notice && <View accessibilityLiveRegion="polite" style={[styles.notice, notice.kind === 'error' && styles.errorNotice]}>
          <Ionicons name={notice.kind === 'success' ? 'checkmark-circle-outline' : 'information-circle-outline'}
            size={19} color={notice.kind === 'error' ? '#A34835' : colors.primary} />
          <Text style={[styles.noticeText, notice.kind === 'error' && styles.errorText]}>{notice.text}</Text>
        </View>}

        {loadFailed ? <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.saveButton}>
          <Text style={styles.saveText}>重新读取配置</Text>
        </Pressable> : <>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={disabled} onPress={() => void run('test')}
              style={({ pressed }) => [styles.testButton, (disabled || pressed) && styles.dim]}>
              {busy === 'test' ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="pulse-outline" size={18} color={colors.primary} />}
              <Text style={styles.testText}>{busy === 'test' ? '测试中…' : '测试连接'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={disabled} onPress={() => void run('save')}
              style={({ pressed }) => [styles.saveButton, styles.saveFlex, (disabled || pressed) && styles.dim]}>
              {busy === 'save' && <ActivityIndicator color="#FFFFFF" />}
              <Text style={styles.saveText}>{busy === 'save' ? '保存中…' : '保存并选用'}</Text>
            </Pressable>
          </View>
          <Text style={styles.footer}>测试会发送一条简短文本，可能产生少量费用，不上传照片。保存仅应用当前服务商的配置。</Text>
          {!!profile.apiKey && <Pressable accessibilityRole="button" disabled={disabled}
            onPress={() => { setShowKey(false); void run('clear'); }} style={styles.clearButton}>
            <Text style={styles.clearText}>{busy === 'clear' ? '正在删除…' : `删除 ${AI_PROVIDERS[provider].name} 本地密钥`}</Text>
          </Pressable>}
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { paddingHorizontal: 22, width: '100%', maxWidth: 600, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backPlaceholder: { width: 44 },
  title: { fontSize: 18, fontWeight: '600', color: colors.ink },
  intro: { alignItems: 'center', paddingTop: 16, paddingBottom: 30 },
  introIcon: { width: 56, height: 56, borderRadius: 19, backgroundColor: '#EDF2F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headline: { fontSize: 23, fontWeight: '600', color: colors.ink },
  description: { fontSize: 13, lineHeight: 22, color: colors.muted, textAlign: 'center', marginTop: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  providers: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, marginBottom: 24 },
  provider: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.65)', backgroundColor: 'rgba(255, 255, 255, 0.22)' },
  customProvider: { flexBasis: '100%' },
  providerSelected: { borderColor: colors.primary, backgroundColor: 'rgba(255, 255, 255, 0.55)' },
  providerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  providerName: { fontSize: 17, fontWeight: '700', color: colors.ink },
  providerHint: { fontSize: 11, lineHeight: 17, marginTop: 8, color: colors.muted },
  loading: { margin: 32 },
  form: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.65)', backgroundColor: 'rgba(255, 255, 255, 0.22)', padding: 18 },
  formHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  draft: { color: colors.subtle, fontSize: 11 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '500', marginTop: 18, marginBottom: 9 },
  input: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.70)', borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.50)', color: colors.ink, paddingHorizontal: 13, paddingVertical: 13, minHeight: 48, fontSize: 14 },
  keyRow: { position: 'relative' },
  keyInput: { paddingRight: 48 },
  eye: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 46, alignItems: 'center', justifyContent: 'center' },
  help: { color: colors.muted, fontSize: 11, lineHeight: 18, marginTop: 7 },
  textAction: { alignSelf: 'flex-start', paddingVertical: 12, marginTop: 6 },
  link: { fontSize: 12, color: '#4E7089' },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 14, borderRadius: 12, backgroundColor: '#EDF4F4', marginTop: 16 },
  noticeText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 19 },
  errorNotice: { backgroundColor: '#FBF0EC' },
  errorText: { color: '#A34835' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  testButton: { flex: 1, minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  testText: { color: '#4E7089', fontSize: 14, fontWeight: '600' },
  saveButton: { minHeight: 50, borderRadius: 16, backgroundColor: '#587991', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 0 },
  saveFlex: { flex: 1.15 },
  saveText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  dim: { opacity: 0.55 },
  footer: { color: colors.subtle, fontSize: 11, lineHeight: 18, marginTop: 12 },
  clearButton: { minHeight: 44, alignSelf: 'center', justifyContent: 'center', marginTop: 14 },
  clearText: { color: colors.muted, fontSize: 12 },
});
