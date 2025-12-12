import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Delete, Check } from 'lucide-react-native';

interface NumericKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue?: number;
  title?: string;
}

export function NumericKeypad({ isOpen, onClose, onConfirm, initialValue = 0, title }: NumericKeypadProps) {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (isOpen) setValue(initialValue.toString());
  }, [isOpen, initialValue]);

  const handlePress = (num: string) => {
    if (value === '0' && num !== '.') {
      setValue(num);
    } else {
      setValue(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1) || '0');
  };

  const handleSubmit = () => {
    onConfirm(parseFloat(value));
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.displayArea}>
            {title && <Text style={styles.title}>{title}</Text>}
            <Text style={styles.displayText}>{value}</Text>
          </View>
          
          <View style={styles.keypadGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keyBtn}
                onPress={() => handlePress(num.toString())}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.keyBtn}
              onPress={() => handlePress('.')}
            >
              <Text style={styles.keyText}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keyBtn}
              onPress={() => handlePress('0')}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keyBtn}
              onPress={handleBackspace}
            >
              <Delete size={24} color="#F87171" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
              <Check size={20} color="#0D1321" />
              <Text style={styles.confirmText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111823',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  displayArea: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  displayText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  keyBtn: {
    width: '33.33%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  cancelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#4EB3B5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: '#0D1321',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
