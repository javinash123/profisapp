import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert, Image } from 'react-native';
import { useMatchStore } from '@/lib/store';
import { NetTile } from '@/components/match/NetTileNative';
import { NumericKeypad } from '@/components/match/NumericKeypadNative';
import { Cloud, Lock, Plus, Bell, Home, StopCircle, Sun, Moon } from 'lucide-react-native';
import { format } from 'date-fns';

const logoSource = Platform.OS === 'web' 
  ? { uri: '/logo.jpeg' } 
  : require('../../assets/logo.jpeg');

export default function LiveMatch({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { 
    matchTitle, 
    pegNumber, 
    startTime, 
    durationMinutes, 
    nets, 
    updateNetWeight, 
    addNet, 
    endMatch,
    unit,
    fieldMode,
    toggleFieldMode,
    alarms
  } = useMatchStore();

  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingNet, setEditingNet] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (startTime) {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remaining = (durationMinutes * 60) - elapsedSeconds;
        setTimeLeft(Math.max(0, remaining));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, durationMinutes]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalWeight = nets.reduce((acc, net) => acc + net.weight, 0);

  const handleAddWeight = (netId: number, amount: number) => {
    const net = nets.find(n => n.id === netId);
    if (net) updateNetWeight(netId, net.weight + amount);
  };

  const handleSubtractWeight = (netId: number, amount: number) => {
    const net = nets.find(n => n.id === netId);
    if (net) updateNetWeight(netId, Math.max(0, net.weight - amount));
  };

  const handleKeypadConfirm = (val: number) => {
    if (editingNet !== null) {
      updateNetWeight(editingNet, val);
    }
  };

  const handleEndMatch = () => {
    if (Platform.OS === 'web') {
      if (confirm("End Match?\nAre you sure you want to finish this session?")) {
        endMatch();
        onNavigate('summary');
      }
    } else {
      Alert.alert(
        "End Match?",
        "Are you sure you want to finish this session?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "End Match", 
            style: "destructive",
            onPress: () => {
              endMatch();
              onNavigate('summary');
            }
          }
        ]
      );
    }
  };

  const activeAlarms = alarms.filter(a => a.enabled);

  return (
    <View style={[styles.container, fieldMode && styles.fieldModeContainer]}>
      {/* Top Bar */}
      <View style={[styles.topBar, fieldMode && styles.fieldModeBorder]}>
        <View style={styles.matchInfo}>
          {/* Image temporarily disabled for testing
          <Image 
            source={logoSource} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
          */}
          <View>
            <Text style={styles.matchTitle} numberOfLines={1}>{matchTitle}</Text>
            <Text style={styles.pegNumber}>PEG {pegNumber}</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => onNavigate('weather')} style={styles.weatherWidget}>
            <Cloud size={16} color="#94a3b8" />
            <Text style={styles.weatherText}>14°C</Text>
          </TouchableOpacity>
          <Text style={styles.clock}>{format(currentTime, 'HH:mm')}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[
          styles.timerText, 
          timeLeft < 300 && styles.timerWarning,
          fieldMode && styles.fieldModeText
        ]}>
          {formatTime(timeLeft)}
        </Text>
        <TouchableOpacity 
          style={styles.lockBtn}
          onPress={toggleFieldMode}
        >
          {fieldMode ? (
            <Sun size={24} color="#F59E0B" />
          ) : (
            <Moon size={24} color="#94a3b8" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Grid */}
      <ScrollView style={styles.gridContainer} contentContainerStyle={styles.gridContent}>
        <View style={styles.grid}>
          {nets.map(net => (
            <View key={net.id} style={[styles.gridItem, isLocked && styles.lockedItem]}>
              <NetTile 
                net={net}
                onEdit={setEditingNet}
                onAdd={(amt) => handleAddWeight(net.id, amt)}
                onSubtract={(amt) => handleSubtractWeight(net.id, amt)}
              />
            </View>
          ))}
          
          {!isLocked && (
            <TouchableOpacity 
              onPress={addNet}
              style={styles.addNetBtn}
            >
              <Plus size={32} color="#94a3b8" />
              <Text style={styles.addNetText}>Add Net</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, fieldMode && styles.fieldModeBottomBar]}>
        {/* Alarms Row */}
        {activeAlarms.length > 0 && (
          <ScrollView horizontal style={styles.alarmList} showsHorizontalScrollIndicator={false}>
            {activeAlarms.map(alarm => (
              <View key={alarm.id} style={styles.alarmBadge}>
                <Bell size={12} color="#4EB3B5" />
                <Text style={styles.alarmText}>{alarm.name} ({alarm.time || 'Loop'})</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.controlsRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL WEIGHT</Text>
            <Text style={styles.totalValue}>
              {totalWeight.toFixed(2)} <Text style={styles.totalUnit}>{unit}</Text>
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('alarms')}>
              <Bell size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.endBtn} onPress={handleEndMatch}>
              <StopCircle size={20} color="white" />
              <Text style={styles.endBtnText}>END</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <NumericKeypad 
        isOpen={editingNet !== null} 
        onClose={() => setEditingNet(null)}
        onConfirm={handleKeypadConfirm}
        initialValue={editingNet ? nets.find(n => n.id === editingNet)?.weight : 0}
        title={editingNet ? `Edit Net ${editingNet} Weight` : 'Edit Weight'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1321',
  },
  fieldModeContainer: {
    backgroundColor: 'black',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  fieldModeBorder: {
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4EB3B5',
    maxWidth: 120,
  },
  pegNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  clock: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'white',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#4EB3B5',
    textShadowColor: 'rgba(78,179,181,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  timerWarning: {
    color: '#EF4444',
  },
  fieldModeText: {
    textShadowColor: 'rgba(78,179,181,0.5)',
    textShadowRadius: 15,
  },
  lockBtn: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom bar
  },
  grid: {
    gap: 12,
  },
  gridItem: {
    width: '100%',
  },
  lockedItem: {
    opacity: 0.5,
  },
  addNetBtn: {
    height: 160,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: Platform.OS === 'web' ? 'dashed' : 'solid', // RN doesn't support dashed nicely
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addNetText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 19, 33, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    gap: 12,
  },
  fieldModeBottomBar: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  alarmList: {
    maxHeight: 30,
  },
  alarmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78,179,181,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  alarmText: {
    color: '#4EB3B5',
    fontSize: 12,
    marginLeft: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'white',
  },
  totalUnit: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  endBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
