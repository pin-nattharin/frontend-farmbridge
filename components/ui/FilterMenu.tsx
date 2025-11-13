import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface FilterMenuProps {
  isVisible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  // ใช้เพื่อคำนวณตำแหน่งการแสดงผลของ Pop-up (ตามตำแหน่งของ Pill ที่ถูกกด)
  positionStyle: { top: number; left?: number; right?: number }; 
  isPrice?: boolean; // สำหรับรูปแบบตัวเลือก "ราคา" ที่มีหน่วย
}

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  isVisible, 
  onClose, 
  options, 
  onSelect, 
  positionStyle,
  isPrice = false,
}) => {
  if (!isVisible) return null;

  const handleSelectOption = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={onClose} // ปิดเมื่อกดนอก Menu
        activeOpacity={1}
      >
        <View style={[styles.menuContainer, positionStyle]}>
          <View style={styles.menu}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionItem, index > 0 && styles.borderTop]}
                onPress={() => handleSelectOption(option.value)}
              >
                <Text style={styles.optionText}>
                  {option.label}
                  {isPrice && <Text style={styles.unitText}> บาท</Text>}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Overlay บางๆ
  },
  menuContainer: {
    position: 'absolute',
    // ตำแหน่งจะถูกกำหนดภายนอก
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    minWidth: 120,
    // เงา
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 14,
    color: '#2D3748',
  },
  unitText: {
    fontSize: 12,
    color: '#718096',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  }
});

export default FilterMenu;