import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Alert,
  ScrollView,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ContactoScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = () => {
    if (!nombre || !correo || !mensaje) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }
    Alert.alert(
      '¡Mensaje Enviado! 🎉', 
      'Nos pondremos en contacto contigo pronto.',
      [{ text: 'Perfecto', onPress: () => navigation.goBack() }]
    );
  };

  const contactOptions = [
    { icono: 'mail', titulo: 'Email', valor: 'soporte@fitnesspro.com' },
    { icono: 'call', titulo: 'Teléfono', valor: '+591 74553638' },
    { icono: 'chatbubbles', titulo: 'Chat en Vivo', valor: 'Disponible 24/7' },
  ];

  const faqs = [
    { pregunta: '¿Cómo cancelo mi suscripción?', icono: 'help-circle' },
    { pregunta: '¿Puedo descargar entrenamientos?', icono: 'download' },
    { pregunta: '¿Cómo sincronizo mi smartwatch?', icono: 'watch' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Pressable 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            
            <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
            <Text style={styles.headerSubtitle}>
              Estamos aquí para ayudarte
            </Text>
          </Animated.View>

          {/* Quick Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONTACTO RÁPIDO</Text>
            <View style={styles.contactGrid}>
              {contactOptions.map((option, index) => (
                <Pressable key={index} style={styles.contactCard}>
                  <Ionicons name={option.icono} size={28} color="#D4FF00" />
                  <Text style={styles.contactTitle}>{option.titulo}</Text>
                  <Text style={styles.contactValue}>{option.valor}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PREGUNTAS FRECUENTES</Text>
            {faqs.map((faq, index) => (
              <Pressable key={index} style={styles.faqCard}>
                <Ionicons name={faq.icono} size={20} color="#D4FF00" />
                <Text style={styles.faqText}>{faq.pregunta}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </Pressable>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ENVÍANOS UN MENSAJE</Text>
            
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput 
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#AEAEB2"
                  style={[
                    styles.input,
                    focusedInput === 'nombre' && styles.inputFocused
                  ]}
                  value={nombre}
                  onChangeText={setNombre}
                  onFocus={() => setFocusedInput('nombre')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <TextInput 
                  placeholder="tu@email.com"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    focusedInput === 'correo' && styles.inputFocused
                  ]}
                  value={correo}
                  onChangeText={setCorreo}
                  onFocus={() => setFocusedInput('correo')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mensaje</Text>
                <TextInput
                  placeholder="¿En qué podemos ayudarte?"
                  placeholderTextColor="#AEAEB2"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.textArea,
                    focusedInput === 'mensaje' && styles.inputFocused
                  ]}
                  value={mensaje}
                  onChangeText={setMensaje}
                  onFocus={() => setFocusedInput('mensaje')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Enviar Mensaje</Text>
              </Pressable>
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SÍGUENOS</Text>
            <View style={styles.socialRow}>
              {[{name: 'camera', color: '#e4405f'}, {name: 'logo-twitter', color: '#1da1f2'}, {name: 'logo-facebook', color: '#4267b2'}, {name: 'logo-youtube', color: '#ff0000'}].map((iconData, index) => (
                <Pressable key={index} style={styles.socialButton}>
                  <Ionicons name={iconData.name} size={24} color={iconData.color} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Fitness Pro © 2026</Text>
            <Text style={styles.footerSubtext}>Versión 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1.5,
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  contactGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
  },
  faqIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  faqText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  faqArrow: {
    fontSize: 22,
    color: '#C7C7CC',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonPressed: {
    backgroundColor: '#333333',
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 26,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#AEAEB2',
  },
});
