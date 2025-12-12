import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { useMatchStore } from '@/lib/store';
import { ArrowLeft, Plus, Bell, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react-native';

export default function AlarmList({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useMatchStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newAlarmName, setNewAlarmName] = useState("");
  const [newAlarmType, setNewAlarmType] = useState<'one-time' | 'repeat'>('one-time');
  const [newAlarmTime, setNewAlarmTime] = useState("");

  const handleAdd = () => {
    addAlarm({
      id: Math.random().toString(36).substr(2, 9),
      name: newAlarmName || "New Alarm",
      type: newAlarmType,
      time: newAlarmTime,
      enabled: true
    });
    setIsAddOpen(false);
    setNewAlarmName("");
    setNewAlarmTime("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('live')} style={styles.backBtn}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alarms & Timers</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {alarms.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#94a3b8" style={{ opacity: 0.2 }} />
            <Text style={styles.emptyText}>No alarms set</Text>
          </View>
        ) : (
          alarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmCard}>
              <View style={styles.alarmInfo}>
                <View style={[styles.iconBadge, alarm.enabled ? styles.activeBadge : styles.inactiveBadge]}>
                  <Bell size={20} color={alarm.enabled ? "#4EB3B5" : "#94a3b8"} />
                </View>
                <View>
                  <Text style={[styles.alarmName, alarm.enabled ? styles.activeText : styles.inactiveText]}>
                    {alarm.name}
                  </Text>
                  <Text style={styles.alarmMeta}>{alarm.type} • {alarm.time || '00:00'}</Text>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => toggleAlarm(alarm.id)}>
                  {alarm.enabled ? (
                    <ToggleRight size={32} color="#4EB3B5" />
                  ) : (
                    <ToggleLeft size={32} color="#94a3b8" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteAlarm(alarm.id)} style={styles.deleteBtn}>
                  <Trash2 size={20} color="#F87171" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddOpen(true)}>
          <Plus size={20} color="#0D1321" />
          <Text style={styles.addBtnText}>Add Alarm</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isAddOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Alarm</Text>
              <TouchableOpacity onPress={() => setIsAddOpen(false)}>
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Alarm Name</Text>
              <TextInput 
                style={styles.input}
                value={newAlarmName}
                onChangeText={setNewAlarmName}
                placeholder="e.g. Feed Pellet"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, newAlarmType === 'one-time' && styles.activeTypeBtn]}
                  onPress={() => setNewAlarmType('one-time')}
                >
                  <Text style={[styles.typeBtnText, newAlarmType === 'one-time' && styles.activeTypeBtnText]}>One-time</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, newAlarmType === 'repeat' && styles.activeTypeBtn]}
                  onPress={() => setNewAlarmType('repeat')}
                >
                  <Text style={[styles.typeBtnText, newAlarmType === 'repeat' && styles.activeTypeBtnText]}>Repeating</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{newAlarmType === 'repeat' ? 'Interval (minutes)' : 'Time (HH:mm)'}</Text>
              <TextInput 
                style={styles.input}
                value={newAlarmTime}
                onChangeText={setNewAlarmTime}
                placeholder={newAlarmType === 'repeat' ? "15" : "14:30"}
                placeholderTextColor="#666"
                keyboardType={newAlarmType === 'repeat' ? "numeric" : "default"}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Alarm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  alarmCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alarmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: 'rgba(78,179,181,0.2)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  alarmName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeText: {
    color: 'white',
  },
  inactiveText: {
    color: '#94a3b8',
  },
  alarmMeta: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'capitalize',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  addBtn: {
    height: 56,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: {
    color: '#0D1321',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111823',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formGroup: {
    marginBottom: 20,
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
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  activeTypeBtn: {
    backgroundColor: '#4EB3B5',
    borderColor: '#4EB3B5',
  },
  typeBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTypeBtnText: {
    color: '#0D1321',
  },
  saveBtn: {
    height: 56,
    backgroundColor: '#4EB3B5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#0D1321',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
