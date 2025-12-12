import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Plus, Minus, Edit2 } from 'lucide-react-native';
import { Net, useMatchStore } from '@/lib/store';

interface NetTileProps {
  net: Net;
  onEdit: (netId: number) => void;
  onAdd: (amount: number) => void;
  onSubtract: (amount: number) => void;
}

export function NetTile({ net, onEdit, onAdd, onSubtract }: NetTileProps) {
  const { unit, fieldMode } = useMatchStore();
  
  const percentage = Math.min(100, (net.weight / net.capacity) * 100);
  
  // Color logic
  let statusColor = "#10B981"; // emerald-500
  let textColor = "#34D399"; // emerald-400
  let borderColor = "rgba(255,255,255,0.1)";
  
  if (percentage >= 95) {
    statusColor = "#E74C3C"; // Danger
    textColor = "#E74C3C";
    borderColor = "#E74C3C";
  } else if (percentage >= 80) {
    statusColor = "#FFC857"; // Warning
    textColor = "#FFC857";
    borderColor = "rgba(255,200,87,0.5)";
  }

  return (
    <View style={[
      styles.container, 
      { borderColor },
      percentage >= 95 && styles.dangerBorder
    ]}>
      <View style={styles.header}>
        <Text style={styles.netId}>NET {net.id}</Text>
        <TouchableOpacity onPress={() => onEdit(net.id)} style={styles.editBtn}>
          <Edit2 size={12} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.weightContainer}>
        <Text style={[styles.weightText, { color: textColor }]}>
          {net.weight.toFixed(2)}
          <Text style={styles.unitText}>{unit}</Text>
        </Text>
        <Text style={styles.maxText}>Max: {net.capacity} {unit}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: statusColor }]} />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.subtractBtn, fieldMode && styles.fieldModeBorder]}
          onPress={() => onSubtract(1)}
        >
          <Minus size={20} color="white" />
          <Text style={styles.btnText}>1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, styles.addBtn, fieldMode && styles.fieldModeBorder]}
          onPress={() => onAdd(1)}
        >
          <Plus size={20} color="#0D1321" />
          <Text style={[styles.btnText, { color: '#0D1321' }]}>1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  dangerBorder: {
    borderWidth: 2,
    borderColor: '#E74C3C',
    shadowColor: '#E74C3C',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  netId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  editBtn: {
    padding: 4,
  },
  weightContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  weightText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  unitText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 4,
  },
  maxText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  subtractBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  addBtn: {
    backgroundColor: '#4EB3B5',
  },
  fieldModeBorder: {
    borderWidth: 2,
    borderColor: 'white',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
