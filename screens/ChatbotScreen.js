import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { 
  enviarMensajeAlChatbot, 
  obtenerMensajeBienvenida, 
  obtenerSugerenciasRapidas 
} from '../services/chatbotService';

const { width } = Dimensions.get('window');

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const [mensajes, setMensajes] = useState([obtenerMensajeBienvenida()]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(true);
  
  const sugerencias = obtenerSugerenciasRapidas();
  
  // Animación para los mensajes nuevos
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [mensajes]);

  // Scroll al último mensaje
  const scrollAlFinal = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Enviar mensaje
  const enviarMensaje = async (texto = inputTexto) => {
    if (!texto.trim() || cargando) return;

    const mensajeUsuario = {
      id: Date.now().toString(),
      texto: texto.trim(),
      esUsuario: true,
      timestamp: new Date().toISOString()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setInputTexto('');
    setMostrarSugerencias(false);
    setCargando(true);
    scrollAlFinal();

    try {
      // Obtener historial para contexto (últimos 10 mensajes)
      const historial = mensajes.slice(-10);
      
      const respuesta = await enviarMensajeAlChatbot(texto.trim(), historial);
      
      const mensajeBot = {
        id: (Date.now() + 1).toString(),
        texto: respuesta.respuesta,
        esUsuario: false,
        timestamp: new Date().toISOString(),
        rutinasRelacionadas: respuesta.rutinasRelacionadas || []
      };

      setMensajes(prev => [...prev, mensajeBot]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const mensajeError = {
        id: (Date.now() + 1).toString(),
        texto: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
        esUsuario: false,
        timestamp: new Date().toISOString()
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setCargando(false);
      scrollAlFinal();
    }
  };

  // Navegar a detalle de rutina
  const irARutina = (rutina) => {
    navigation.navigate('Detalle', { rutina });
  };

  // Renderizar mensaje
  const renderMensaje = (mensaje, index) => {
    const esUsuario = mensaje.esUsuario;
    
    return (
      <Animated.View 
        key={mensaje.id || index}
        style={[
          styles.mensajeContainer,
          esUsuario ? styles.mensajeUsuario : styles.mensajeBot,
          { opacity: fadeAnim }
        ]}
      >
        {!esUsuario && (
          <View style={styles.avatarBot}>
            <Ionicons name="fitness" size={20} color="#FFFFFF" />
          </View>
        )}
        
        <View style={[
          styles.burbuja,
          esUsuario ? styles.burbujaUsuario : styles.burbujaBot
        ]}>
          <Text style={[
            styles.textoMensaje,
            esUsuario ? styles.textoUsuario : styles.textoBot
          ]}>
            {mensaje.texto}
          </Text>
        </View>
        
        {esUsuario && (
          <View style={styles.avatarUsuario}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    );
  };

  // Renderizar cards de rutinas recomendadas
  const renderRutinasCards = (rutinas) => {
    if (!rutinas || rutinas.length === 0) return null;

    return (
      <View style={styles.rutinasCardsContainer}>
        <View style={styles.rutinasCardsHeader}>
          <Ionicons name="sparkles" size={16} color="#D4FF00" />
          <Text style={styles.rutinasCardsTitle}>Rutinas recomendadas para ti</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rutinasCardsScroll}
        >
          {rutinas.map((rutina, idx) => (
            <Pressable
              key={idx}
              style={styles.rutinaCard}
              onPress={() => irARutina(rutina)}
            >
              <Image 
                source={{ 
                  uri: rutina.image || rutina.imagen || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' 
                }}
                style={styles.rutinaCardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.rutinaCardGradient}
              />
              <View style={styles.rutinaCardBadge}>
                <Text style={styles.rutinaCardBadgeText}>{rutina.categoria || 'Fitness'}</Text>
              </View>
              <View style={styles.rutinaCardContent}>
                <Text style={styles.rutinaCardNombre} numberOfLines={2}>
                  {rutina.nombre}
                </Text>
                <View style={styles.rutinaCardMeta}>
                  <View style={styles.rutinaCardMetaItem}>
                    <Ionicons name="time-outline" size={12} color="#D4FF00" />
                    <Text style={styles.rutinaCardMetaText}>{rutina.duracion || '30 min'}</Text>
                  </View>
                  <View style={styles.rutinaCardMetaItem}>
                    <Ionicons name="fitness-outline" size={12} color="#D4FF00" />
                    <Text style={styles.rutinaCardMetaText}>{rutina.nivel || 'Todos'}</Text>
                  </View>
                </View>
                {rutina.trainer && (
                  <View style={styles.rutinaCardTrainer}>
                    <Ionicons name="person-circle-outline" size={14} color="#888" />
                    <Text style={styles.rutinaCardTrainerText}>{rutina.trainer}</Text>
                  </View>
                )}
              </View>
              <View style={styles.rutinaCardArrow}>
                <Ionicons name="play-circle" size={32} color="#D4FF00" />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Encontrar el último mensaje del bot con rutinas
  const obtenerUltimasRutinasRecomendadas = () => {
    for (let i = mensajes.length - 1; i >= 0; i--) {
      if (!mensajes[i].esUsuario && mensajes[i].rutinasRelacionadas?.length > 0) {
        return mensajes[i].rutinasRelacionadas;
      }
    }
    return [];
  };

  // Renderizar sugerencias
  const renderSugerencias = () => {
    if (!mostrarSugerencias) return null;
    
    return (
      <View style={styles.sugerenciasContainer}>
        <Text style={styles.sugerenciasLabel}>Sugerencias rápidas:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sugerenciasScroll}
        >
          {sugerencias.map((sugerencia, index) => (
            <Pressable
              key={index}
              style={styles.sugerenciaChip}
              onPress={() => enviarMensaje(sugerencia)}
            >
              <Text style={styles.sugerenciaTexto}>{sugerencia}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="fitness" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>FitBot</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>En línea</Text>
            </View>
          </View>
        </View>
        
        <Pressable 
          style={styles.menuButton}
          onPress={() => {
            setMensajes([obtenerMensajeBienvenida()]);
            setMostrarSugerencias(true);
          }}
        >
          <Ionicons name="refresh" size={22} color="#FFFFFF" />
        </Pressable>
      </LinearGradient>

      {/* Área de mensajes */}
      <KeyboardAvoidingView 
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.mensajesScroll}
          contentContainerStyle={styles.mensajesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollAlFinal}
        >
          {mensajes.map((mensaje, index) => (
            <React.Fragment key={mensaje.id || index}>
              {renderMensaje(mensaje, index)}
              {/* Mostrar cards de rutinas después del mensaje del bot que las contiene */}
              {!mensaje.esUsuario && mensaje.rutinasRelacionadas?.length > 0 && 
                renderRutinasCards(mensaje.rutinasRelacionadas)
              }
            </React.Fragment>
          ))}
          
          {cargando && (
            <View style={[styles.mensajeContainer, styles.mensajeBot]}>
              <View style={styles.avatarBot}>
                <Ionicons name="fitness" size={20} color="#FFFFFF" />
              </View>
              <View style={[styles.burbuja, styles.burbujaBot, styles.burbujaTyping]}>
                <ActivityIndicator size="small" color="#A78BFA" />
                <Text style={styles.typingText}>FitBot está escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sugerencias */}
        {renderSugerencias()}

        {/* Input área */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#666"
              value={inputTexto}
              onChangeText={setInputTexto}
              multiline
              maxLength={500}
              onSubmitEditing={() => enviarMensaje()}
              returnKeyType="send"
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputTexto.trim() || cargando) && styles.sendButtonDisabled
              ]}
              onPress={() => enviarMensaje()}
              disabled={!inputTexto.trim() || cargando}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputTexto.trim() && !cargando ? '#FFFFFF' : '#666'} 
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  mensajesScroll: {
    flex: 1,
  },
  mensajesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  mensajeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  mensajeUsuario: {
    justifyContent: 'flex-end',
  },
  mensajeBot: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarUsuario: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  burbuja: {
    maxWidth: width * 0.7,
    padding: 12,
    borderRadius: 18,
  },
  burbujaUsuario: {
    backgroundColor: '#4ECDC4',
    borderBottomRightRadius: 4,
  },
  burbujaBot: {
    backgroundColor: '#1e1e32',
    borderBottomLeftRadius: 4,
  },
  burbujaTyping: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  typingText: {
    color: '#888',
    marginLeft: 10,
    fontSize: 13,
  },
  textoMensaje: {
    fontSize: 15,
    lineHeight: 22,
  },
  textoUsuario: {
    color: '#000000',
  },
  textoBot: {
    color: '#FFFFFF',
  },
  rutinasContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  rutinasLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  rutinaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  rutinaButtonText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  sugerenciasContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  sugerenciasLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  sugerenciasScroll: {
    paddingRight: 15,
  },
  sugerenciaChip: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  sugerenciaTexto: {
    color: '#A78BFA',
    fontSize: 13,
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: '#0f0f1a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1e1e32',
    borderRadius: 25,
    paddingLeft: 18,
    paddingRight: 5,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A78BFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2a2a3e',
  },
  // Estilos para las cards de rutinas recomendadas
  rutinasCardsContainer: {
    marginLeft: 43,
    marginTop: 5,
    marginBottom: 15,
  },
  rutinasCardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  rutinasCardsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4FF00',
  },
  rutinasCardsScroll: {
    paddingRight: 15,
  },
  rutinaCard: {
    width: 200,
    height: 240,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#1e1e32',
  },
  rutinaCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  rutinaCardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  rutinaCardBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(212, 255, 0, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rutinaCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
  },
  rutinaCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  rutinaCardNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  rutinaCardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  rutinaCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rutinaCardMetaText: {
    fontSize: 11,
    color: '#D4FF00',
    fontWeight: '500',
  },
  rutinaCardTrainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rutinaCardTrainerText: {
    fontSize: 11,
    color: '#888',
  },
  rutinaCardArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default ChatbotScreen;
