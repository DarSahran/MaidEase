import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const RAG_API_URL = 'https://rag-backend-keg223cey-darsahrans-projects.vercel.app/api/rag'; // Change here if redeployed
const ACCENT = '#2ec4b6';
const BG = '#f7fafc';

function TypingDots({ anim }: { anim: Animated.Value }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 18 }}>
      {[0, 1, 2].map(i => (
        <Animated.View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 4, marginHorizontal: 2,
            backgroundColor: ACCENT,
            opacity: anim.interpolate({
              inputRange: [i - 1, i, i + 1],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            }),
            transform: [{
              scale: anim.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              })
            }]
          }}
        />
      ))}
    </View>
  );
}

export default function ShaantaPage() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<{
    from: string;
    text: string;
    ts: Date;
  }[]>([
    { from: 'bot', text: 'Hi! I am Shaanta, your support assistant. How can I help you today?', ts: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const typingAnim = useRef(new Animated.Value(0)).current;


  // Animate typing dots
  useEffect(() => {
    if (showTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(typingAnim, { toValue: 2, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(typingAnim, { toValue: 3, duration: 400, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(typingAnim, { toValue: 0, duration: 400, useNativeDriver: true, easing: Easing.linear }),
        ])
      ).start();
    } else {
      typingAnim.stopAnimation();
      typingAnim.setValue(0);
    }
  }, [showTyping]);


  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => setKeyboardOffset(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOffset(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, showTyping]);


  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "#fff",
    },
    gradientBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      backgroundColor: "#fff",
    },
    header: {
      width: '100%',
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingHorizontal: 8,
      borderBottomWidth: 0,
      shadowColor: ACCENT,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    headerLogo: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      shadowColor: ACCENT,
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    headerLogoText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 26,
      letterSpacing: 1,
    },
    headerTextWrap: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#222',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 15,
      color: ACCENT,
      fontWeight: '500',
      marginTop: 0,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#2ec4b6',
      marginLeft: 6,
    },
    quickActions: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      marginTop: 0,
    },
    quickBtn: {
      backgroundColor: ACCENT,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      alignItems: 'center',
      flexDirection: 'row',
      shadowColor: ACCENT,
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    quickBtnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
      marginLeft: 6,
    },
    chatArea: {
      flex: 1,
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
      width: '100%',
      backgroundColor: 'transparent',
    },
    messages: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
    },
    userMsg: {
      alignSelf: 'flex-end',
      backgroundColor: '#fff',
      borderRadius: 20,
      marginVertical: 7,
      paddingVertical: 13,
      paddingHorizontal: 20,
      maxWidth: '75%',
      minWidth: 48,
      borderWidth: 1.5,
      borderColor: ACCENT,
      shadowColor: ACCENT,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    botMsgWrap: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 2,
    },
    botAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    botMsg: {
      alignSelf: 'flex-start',
      backgroundColor: '#e6fcf7',
      borderRadius: 20,
      marginVertical: 7,
      paddingVertical: 13,
      paddingHorizontal: 20,
      maxWidth: '75%',
      minWidth: 48,
      shadowColor: ACCENT,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    userMsgText: {
      color: ACCENT,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '500',
    },
    botMsgText: {
      color: '#222',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
    },
    msgTime: {
      fontSize: 11,
      color: '#888',
      marginTop: 2,
      marginLeft: 2,
      marginRight: 2,
      alignSelf: 'flex-end',
    },
    typingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 4,
      gap: 8,
      alignSelf: 'flex-start',
      paddingLeft: 2,
    },
    avatarSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: ACCENT,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
      shadowColor: ACCENT,
      shadowOpacity: 0.10,
      shadowRadius: 2,
      elevation: 1,
    },
    avatarTextSmall: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      letterSpacing: 1,
    },
    typingBubble: {
      backgroundColor: '#e6fcf7',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 7,
      minWidth: 36,
      minHeight: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: ACCENT,
      shadowColor: ACCENT,
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#e3e9f1',
      minHeight: 62,
      gap: 8,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      shadowColor: ACCENT,
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 4,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    input: {
      flex: 1,
      height: 48,
      borderColor: ACCENT,
      borderWidth: 1.5,
      borderRadius: 24,
      paddingHorizontal: 18,
      fontSize: 17,
      backgroundColor: '#f7f8fa',
      color: '#222',
      marginRight: 2,
      shadowColor: ACCENT,
      shadowOpacity: 0.10,
      shadowRadius: 2,
      elevation: 2,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#e6fcf7',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
      shadowColor: ACCENT,
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    sendBtn: {
      marginLeft: 2,
      backgroundColor: ACCENT,
      borderRadius: 22,
      paddingHorizontal: 0,
      paddingVertical: 0,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: ACCENT,
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    sendBtnDisabled: {
      backgroundColor: '#b0c7e6',
    },
    sendBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.2,
    },
  });

  // Helper: fetch with timeout
  async function fetchWithTimeout(resource: RequestInfo, options: any = {}, timeout = 30000) {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
  }

  // Send message to RAG+LLM backend API
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowTyping(true); // Show typing animation immediately
    setLoading(true);
    const payload = {
      question: input,
      history: [
        ...messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: input }
      ]
    };
    console.log('Sending to LLM:', payload);
    try {
      const res: any = await fetchWithTimeout(RAG_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 30000);
      if (!res || !('ok' in res)) throw new Error('No response');
      const data = await res.json();
      console.log('LLM response:', data);
      if (!res.ok) {
        setMessages(prev => [...prev, { from: 'bot', text: `Error: ${data.error || 'Unknown error'}. Details: ${data.details || ''}`, ts: new Date() }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: data.answer || 'Sorry, I could not get a response.', ts: new Date() }]);
      }
    } catch (e: any) {
      if (e && e.message === 'timeout') {
        setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, this is taking too long. Please try to rephrase your question or be more specific so Shaanta can help you better.', ts: new Date() }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: 'Error contacting Shaanta assistant.', ts: new Date() }]);
      }
    } finally {
      setLoading(false);
      setShowTyping(false);
    }
  };

  // Quick actions for maid services
const quickActions: { icon: 'cleaning-services' | 'local-offer' | 'feedback' | 'support-agent' | 'schedule' | 'info'; label: string }[] = [
    { icon: 'cleaning-services', label: 'Book Cleaning' },
    { icon: 'local-offer', label: 'View Offers' },
    { icon: 'feedback', label: 'Feedback' },
    { icon: 'support-agent', label: 'Contact Support' },
    { icon: 'schedule', label: 'My Bookings' },
    { icon: 'info', label: 'About Us' },
];

  function formatTime(ts: Date) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <View style={styles.gradientBg} />
          {/* Header */}
          <View style={styles.header} accessibilityRole="header">
            <View style={styles.headerLogo}>
              <Text style={styles.headerLogoText} accessibilityLabel="Maid Service Logo">M</Text>
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>MaidEase Chat</Text>
              <Text style={styles.headerSubtitle}>How can we help you today?</Text>
            </View>
            <View style={styles.statusDot} />
          </View>
          {/* Quick Actions */}
          <View style={{ height: 36, justifyContent: 'center', marginTop: 8 }}>
            <ScrollView
              style={styles.quickActions}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 0, gap: 0 }}
            >
              {quickActions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickBtn}
                  activeOpacity={0.8}
                  onPress={async () => {
                    if (!loading) {
                      setMessages(prev => [...prev, { from: 'user', text: action.label, ts: new Date() }]);
                      setShowTyping(true);
                      setLoading(true);
                      try {
                        const res: any = await fetchWithTimeout(RAG_API_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            question: action.label,
                            history: [
                              ...messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
                              { role: 'user', content: action.label }
                            ]
                          }),
                        }, 10000);
                        if (!res || !('ok' in res)) throw new Error('No response');
                        const data = await res.json();
                        if (!res.ok) {
                          setMessages(prev => [...prev, { from: 'bot', text: `Error: ${data.error || 'Unknown error'}. Details: ${data.details || ''}`, ts: new Date() }]);
                        } else {
                          setMessages(prev => [...prev, { from: 'bot', text: data.answer || 'Sorry, I could not get a response.', ts: new Date() }]);
                        }
                      } catch (e: any) {
                        if (e && e.message === 'timeout') {
                          setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, this is taking too long. Please try to rephrase your question or be more specific so Shaanta can help you better.', ts: new Date() }]);
                        } else {
                          setMessages(prev => [...prev, { from: 'bot', text: 'Error contacting Shaanta assistant.', ts: new Date() }]);
                        }
                      } finally {
                        setLoading(false);
                        setShowTyping(false);
                      }
                    }
                  }}
                >
                  <MaterialIcons name={action.icon} size={20} color="#fff" />
                  <Text style={styles.quickBtnText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Chat Area */}
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
          >
            <ScrollView
              style={styles.messages}
              contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
              ref={scrollViewRef}
              keyboardShouldPersistTaps="handled"
              accessible
              accessibilityLabel="Chat messages"
            >
              {messages.map((msg, idx) => (
                msg.from === 'bot' ? (
                  <View key={idx} style={styles.botMsgWrap}>
                    <View style={styles.botAvatar}><Text style={styles.avatarTextSmall}>M</Text></View>
                    <View style={styles.botMsg} accessibilityLabel="Maid reply">
                      <Text style={styles.botMsgText}>{msg.text}</Text>
                      <Text style={styles.msgTime}>{formatTime(msg.ts)}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={idx} style={styles.userMsg} accessibilityLabel="Your message">
                    <Text style={styles.userMsgText}>{msg.text}</Text>
                    <Text style={styles.msgTime}>{formatTime(msg.ts)}</Text>
                  </View>
                )
              ))}
              {showTyping && (
                <View style={styles.typingRow}>
                  <View style={styles.avatarSmall}><Text style={styles.avatarTextSmall}>M</Text></View>
                  <View style={styles.typingBubble}>
                    <TypingDots anim={typingAnim} />
                  </View>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
          {/* Input Area - always above safe area bottom */}
          <View
            style={[
              styles.inputRow,
              {
                paddingBottom:
                  Math.max(insets.bottom, keyboardOffset),
              },
            ]}
            accessible
            accessibilityLabel="Message input area"
          >
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="mic-outline" size={22} color={ACCENT} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#b0c7e6"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!loading}
              accessibilityLabel="Type a message"
            />
            <TouchableOpacity
              style={[styles.sendBtn, loading || !input.trim() ? styles.sendBtnDisabled : null]}
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              accessibilityLabel="Send message"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading || !input.trim() }}
            >
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
