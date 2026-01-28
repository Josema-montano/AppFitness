import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { poblarBaseDeDatos, limpiarBaseDeDatos } from '../services/seedDatabase';
import { useApp } from '../context/AppContext';

export default function AdminScreen({ navigation }) {
  const { reloadData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleReloadData = async () => {
    setIsReloading(true);
    try {
      await reloadData();
      setResultado({ success: true, message: '¡Datos recargados exitosamente!' });
      if (Platform.OS === 'web') {
        window.alert('¡Datos recargados desde Firebase!');
      } else {
        Alert.alert('Éxito', '¡Datos recargados desde Firebase!');
      }
    } catch (error) {
      setResultado({ success: false, message: `Error: ${error.message}` });
    } finally {
      setIsReloading(false);
    }
  };

  const handleLimpiarDB = async () => {
    const confirmar = Platform.OS === 'web' 
      ? window.confirm('⚠️ ¿Estás seguro de que deseas BORRAR TODOS los datos de la base de datos?')
      : true;
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        '⚠️ Limpiar Base de Datos',
        '¿Estás seguro de que deseas BORRAR TODOS los datos? Esta acción no se puede deshacer.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Borrar Todo', style: 'destructive', onPress: ejecutarLimpieza }
        ]
      );
    } else if (confirmar) {
      ejecutarLimpieza();
    }
  };

  const ejecutarLimpieza = async () => {
    setIsDeleting(true);
    setResultado(null);
    
    try {
      await limpiarBaseDeDatos();
      setResultado({ success: true, message: '¡Base de datos limpiada exitosamente!' });
      
      if (Platform.OS === 'web') {
        window.alert('¡Base de datos limpiada exitosamente!');
      } else {
        Alert.alert('Éxito', '¡Base de datos limpiada exitosamente!');
      }
    } catch (error) {
      setResultado({ success: false, message: `Error: ${error.message}` });
      
      if (Platform.OS === 'web') {
        window.alert(`Error limpiando la base de datos: ${error.message}`);
      } else {
        Alert.alert('Error', `Error limpiando la base de datos: ${error.message}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePoblarDB = async () => {
    const confirmar = Platform.OS === 'web' 
      ? window.confirm('¿Deseas poblar la base de datos con datos iniciales?')
      : true;
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Poblar Base de Datos',
        '¿Deseas poblar la base de datos con datos iniciales? Esto puede tomar unos segundos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Poblar', onPress: ejecutarPoblacion }
        ]
      );
    } else if (confirmar) {
      ejecutarPoblacion();
    }
  };

  const ejecutarPoblacion = async () => {
    setIsLoading(true);
    setResultado(null);
    
    try {
      await poblarBaseDeDatos();
      setResultado({ success: true, message: '¡Base de datos poblada exitosamente!' });
      
      if (Platform.OS === 'web') {
        window.alert('¡Base de datos poblada exitosamente!');
      } else {
        Alert.alert('Éxito', '¡Base de datos poblada exitosamente!');
      }
    } catch (error) {
      setResultado({ success: false, message: `Error: ${error.message}` });
      
      if (Platform.OS === 'web') {
        window.alert(`Error poblando la base de datos: ${error.message}`);
      } else {
        Alert.alert('Error', `Error poblando la base de datos: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Administración</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Ionicons name="server" size={48} color="#D4FF00" />
          <Text style={styles.cardTitle}>Base de Datos Firebase</Text>
          <Text style={styles.cardDesc}>
            Pobla la base de datos Firestore con los datos iniciales de ejercicios, 
            rutinas, trainers y categorías.
          </Text>
          
          <Pressable 
            style={[styles.buttonDanger, isDeleting && styles.buttonDisabled]}
            onPress={handleLimpiarDB}
            disabled={isDeleting || isLoading}
          >
            {isDeleting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonTextDanger}>Borrando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.buttonTextDanger}>Limpiar Base de Datos</Text>
              </>
            )}
          </Pressable>

          <Pressable 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handlePoblarDB}
            disabled={isLoading || isDeleting || isReloading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#000" size="small" />
                <Text style={styles.buttonText}>Poblando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#000" />
                <Text style={styles.buttonText}>Poblar Base de Datos</Text>
              </>
            )}
          </Pressable>

          <Pressable 
            style={[styles.buttonSecondary, isReloading && styles.buttonDisabled]}
            onPress={handleReloadData}
            disabled={isLoading || isDeleting || isReloading}
          >
            {isReloading ? (
              <>
                <ActivityIndicator color="#D4FF00" size="small" />
                <Text style={styles.buttonTextSecondary}>Recargando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#D4FF00" />
                <Text style={styles.buttonTextSecondary}>Recargar Datos en App</Text>
              </>
            )}
          </Pressable>
          
          {resultado && (
            <View style={[styles.resultado, resultado.success ? styles.resultadoSuccess : styles.resultadoError]}>
              <Ionicons 
                name={resultado.success ? "checkmark-circle" : "alert-circle"} 
                size={20} 
                color={resultado.success ? "#4CAF50" : "#f44336"} 
              />
              <Text style={[styles.resultadoText, resultado.success ? styles.resultadoTextSuccess : styles.resultadoTextError]}>
                {resultado.message}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Datos que se crearán:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="fitness" size={16} color="#D4FF00" />
            <Text style={styles.infoText}>26 Ejercicios (Cardio, Fuerza, Flexibilidad, Core)</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="barbell" size={16} color="#D4FF00" />
            <Text style={styles.infoText}>23 Rutinas de entrenamiento</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={16} color="#D4FF00" />
            <Text style={styles.infoText}>3 Trainers profesionales</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="folder" size={16} color="#D4FF00" />
            <Text style={styles.infoText}>2 Categorías principales con subcategorías</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#D4FF00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  buttonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonTextDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#D4FF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4FF00',
  },
  resultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultadoSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  resultadoError: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  resultadoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultadoTextSuccess: {
    color: '#4CAF50',
  },
  resultadoTextError: {
    color: '#f44336',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
  },
});
