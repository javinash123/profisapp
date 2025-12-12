import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { useMatchStore } from '@/lib/store';
import Slider from '@react-native-community/slider';
import { Play } from 'lucide-react-native';

export default function MatchSetup({ onStart }: { onStart: () => void }) {
  const { startMatch, unit, setUnit, toggleFieldMode, fieldMode } = useMatchStore();
  
  const [title, setTitle] = useState("Sunday Open");
  const [peg, setPeg] = useState("");
  const [hours, setHours] = useState(5);
  const [nets, setNets] = useState(3);
  const [capacity, setCapacity] = useState(50);

  const handleStart = () => {
    startMatch(title, peg, hours * 60, nets, capacity);
    onStart();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Image 
          source={{ uri: '/logo.jpeg' }} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.headerTitle}>Match Setup</Text>
        <Text style={styles.headerSubtitle}>Configure your session settings</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Match Title</Text>
        <TextInput 
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Club Match"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Peg Number</Text>
          <TextInput 
            style={[styles.input, { textAlign: 'center' }]}
            value={peg}
            onChangeText={setPeg}
            placeholder="#"
            placeholderTextColor="#666"
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Duration ({hours}h)</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setHours(Math.max(1, hours - 0.5))} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterText}>{hours}h</Text>
            <TouchableOpacity onPress={() => setHours(hours + 0.5)} style={styles.counterBtn}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sliderGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Number of Nets</Text>
            <Text style={styles.valueText}>{nets}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={6}
            step={1}
            value={nets}
            onValueChange={setNets}
            minimumTrackTintColor="#4EB3B5"
            maximumTrackTintColor="#FFFFFF"
            thumbTintColor="#4EB3B5"
          />
        </View>

        <View style={styles.sliderGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Net Capacity ({unit})</Text>
            <Text style={styles.valueText}>{capacity}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={100}
            step={5}
            value={capacity}
            onValueChange={setCapacity}
            minimumTrackTintColor="#4EB3B5"
            maximumTrackTintColor="#FFFFFF"
            thumbTintColor="#4EB3B5"
          />
        </View>
      </View>

      <View style={styles.unitToggle}>
        <Text style={styles.label}>Unit System</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, unit === 'lb' && styles.toggleBtnActive]} 
            onPress={() => setUnit('lb')}
          >
            <Text style={[styles.toggleBtnText, unit === 'lb' && styles.toggleBtnTextActive]}>LB/OZ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, unit === 'kg' && styles.toggleBtnActive]} 
            onPress={() => setUnit('kg')}
          >
            <Text style={[styles.toggleBtnText, unit === 'kg' && styles.toggleBtnTextActive]}>KG/G</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Play color="black" size={24} fill="black" />
        <Text style={styles.startBtnText}>START MATCH</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fieldModeLink} onPress={toggleFieldMode}>
        <Text style={styles.linkText}>
          {fieldMode ? "Disable" : "Enable"} High Contrast Field Mode
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4EB3B5',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    color: 'white',
    fontSize: 18,
    // @ts-ignore - outlineStyle is valid for web but not in RN types
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 56, // Match input height roughly
  },
  counterBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: 'white',
    fontSize: 24,
  },
  counterText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  sliderGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueText: {
    color: '#4EB3B5',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleBtnActive: {
    backgroundColor: '#334155', // default variant style approximation
    borderColor: '#334155',
  },
  toggleBtnText: {
    color: 'white',
    fontSize: 14,
  },
  toggleBtnTextActive: {
    fontWeight: 'bold',
  },
  startBtn: {
    backgroundColor: '#4EB3B5',
    height: 64,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4EB3B5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  startBtnText: {
    color: '#0D1321',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fieldModeLink: {
    alignItems: 'center',
    marginBottom: 32,
  },
  linkText: {
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
});
