import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useMatchStore } from '@/lib/store';
import { Share2, Download, RotateCcw } from 'lucide-react-native';

export default function EndSummary({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { matchTitle, pegNumber, nets, unit, durationMinutes } = useMatchStore();
  const totalWeight = nets.reduce((acc, net) => acc + net.weight, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Match Summary</Text>
        <Text style={styles.subtitle}>{matchTitle} • Peg {pegNumber}</Text>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.gradientLine} />
        <Text style={styles.totalLabel}>TOTAL WEIGHT</Text>
        <Text style={styles.totalValue}>
          {totalWeight.toFixed(2)}
          <Text style={styles.totalUnit}>{unit}</Text>
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{nets.length} Nets Used</Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={styles.statText}>{durationMinutes / 60} Hours</Text>
        </View>
      </View>

      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>NET BREAKDOWN</Text>
        {nets.map((net) => (
          <View key={net.id} style={styles.netRow}>
            <View style={styles.netInfo}>
              <View style={styles.netBadge}>
                <Text style={styles.netBadgeText}>{net.id}</Text>
              </View>
              <View>
                <Text style={styles.netName}>Net {net.id}</Text>
                <Text style={styles.netMax}>Max: {net.capacity}{unit}</Text>
              </View>
            </View>
            <Text style={styles.netWeight}>
              {net.weight.toFixed(2)}
              <Text style={styles.netUnit}>{unit}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.outlineBtn}>
          <Share2 size={16} color="white" />
          <Text style={styles.outlineBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn}>
          <Download size={16} color="white" />
          <Text style={styles.outlineBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.restartBtn}
        onPress={() => onNavigate('setup')}
      >
        <RotateCcw size={20} color="#0D1321" />
        <Text style={styles.restartBtnText}>Start New Match</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4EB3B5',
    fontWeight: '500',
  },
  mainCard: {
    backgroundColor: '#111823',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#4EB3B5',
    opacity: 0.5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  totalUnit: {
    fontSize: 20,
    color: '#94a3b8',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statDot: {
    color: '#94a3b8',
  },
  breakdownContainer: {
    gap: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  netInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  netBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  netBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  netName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  netMax: {
    color: '#94a3b8',
    fontSize: 12,
  },
  netWeight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  netUnit: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  outlineBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  outlineBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  restartBtn: {
    height: 56,
    backgroundColor: '#4EB3B5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  restartBtnText: {
    color: '#0D1321',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
