import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ใช้สำหรับไอคอนแว่นขยาย

interface SearchBarProps {
  onSearch: (query: string) => void; // ฟังก์ชันที่จะทำงานเมื่อกดปุ่มค้นหา
  placeholder?: string;
  initialQuery?: string;
}

const SearchBarWithButton: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "ค้นหาผลผลิต...", 
  initialQuery = "" 
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSearchPress = () => {
    onSearch(query.trim()); // ส่งค่าที่ค้นหาออกไป
  };

  return (
    <View style={styles.container}>
      {/* ช่องกรอกข้อมูล (Input) */}
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchPress} // ค้นหาเมื่อกด Enter บน Keyboard
          returnKeyType="search"
        />
      </View>
      
      {/* ปุ่มค้นหา */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
        <Text style={styles.searchButtonText}>ค้นหา</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F7FAFC', // พื้นหลังอ่อนๆ ของหน้าจอ
  },
  searchInputWrapper: {
    flex: 1, // ทำให้ช่อง Input ขยายเต็มพื้นที่ที่เหลือ
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 45,
    marginRight: 10,
    // เพิ่มเงาให้ดูมีมิติ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  searchButton: {
    backgroundColor: '#38A169', // สีเขียวหลัก
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SearchBarWithButton;