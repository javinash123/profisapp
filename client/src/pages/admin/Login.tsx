import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    // Mock login delay
    setTimeout(() => {
      if (email === 'admin@pegpro.com' && password === 'admin') {
        if (Platform.OS === 'web') {
           alert('Logged in successfully!');
        } else {
           Alert.alert('Success', 'Logged in successfully!');
        }
      } else {
        if (Platform.OS === 'web') {
           alert('Error: Invalid credentials. Try admin@pegpro.com / admin');
        } else {
           Alert.alert('Error', 'Invalid credentials. Try admin@pegpro.com / admin');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          {/* On web, /logo.jpeg works. On native, you need require or URI */}
          <Image 
            source={{ uri: '/logo.jpeg' }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>PegPro Admin</Text>
          <Text style={styles.subtitle}>Sign in to manage the platform</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@pegpro.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0D1321" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Protected System • Authorized Personnel Only
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // Ensure full height on web
    minHeight: '100%', 
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8', // muted-foreground
  },
  card: {
    backgroundColor: '#111823',
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#202A3A',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4EB3B5',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#0D1321',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
  },
});

