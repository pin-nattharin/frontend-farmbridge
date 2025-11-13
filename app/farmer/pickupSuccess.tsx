import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // (ใช้ไอคอน check)

const PickupSuccessScreen = () => {
  const router = useRouter();

  const handleOK = () => {
    router.replace('/'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'ทำรายการสำเร็จ', headerLeft: () => null }} />

      <View style={styles.container}>
        {/* --- ไอคอน Check --- */}
        <View style={styles.checkCircle}>
          <MaterialIcons name="check" size={100} color="white" />
        </View>

        {/* --- ข้อความ --- */}
        <Text style={styles.title}>ทำรายการสำเร็จ !</Text>
        <Text style={styles.subtitle}>การทำรายการเสร็จสมบูรณ์</Text>

        {/* --- ปุ่มตกลง --- */}
        <TouchableOpacity style={styles.buttonSolid} onPress={handleOK}>
          <Text style={styles.buttonSolidText}>ตกลง</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#28a745', // สีเขียว
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056b3', // (สีน้ำเงินตาม UI)
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
  },
  buttonSolid: {
    backgroundColor: '#28a745', // สีเขียว
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonSolidText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PickupSuccessScreen;