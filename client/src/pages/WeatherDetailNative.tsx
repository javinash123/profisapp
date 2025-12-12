import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, Cloud, Wind, CloudRain, Droplets, ArrowUpRight } from 'lucide-react-native';

export default function WeatherDetail({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('live')} style={styles.backBtn}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Conditions</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mainCard}>
          <Cloud size={96} color="#4EB3B5" />
          <View style={styles.tempContainer}>
            <Text style={styles.tempText}>14°</Text>
            <Text style={styles.conditionText}>Overcast Clouds</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={styles.cardLabel}>
              <Wind size={20} color="#94a3b8" />
              <Text style={styles.labelText}>Wind</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>12</Text>
              <Text style={styles.unitText}>mph</Text>
            </View>
            <View style={styles.directionRow}>
              <ArrowUpRight size={12} color="#4EB3B5" />
              <Text style={styles.directionText}>NE Direction</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardLabel}>
              <Droplets size={20} color="#94a3b8" />
              <Text style={styles.labelText}>Humidity</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>78</Text>
              <Text style={styles.unitText}>%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardLabel}>
              <CloudRain size={20} color="#94a3b8" />
              <Text style={styles.labelText}>Pressure</Text>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>1012</Text>
              <Text style={styles.unitText}>hPa</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>Last updated: 10:45 AM • Offline Cached</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mainCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)', // blue-900/50 approx
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
    gap: 16,
  },
  tempContainer: {
    alignItems: 'center',
  },
  tempText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 70,
  },
  conditionText: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%', // approx half with gap
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  cardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  unitText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directionText: {
    fontSize: 12,
    color: '#4EB3B5',
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 32,
    marginBottom: 48,
  },
});
