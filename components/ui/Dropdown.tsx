import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import DropDownPicker, { DropDownPickerProps } from 'react-native-dropdown-picker';

// สีที่ใช้ (โดยประมาณจากรูป)
const COLORS = {
  primary: '#074E9F', 
  lightBlue: '#E0ECFF',
  white: '#FFFFFF',
  text: '#074E9F',
};

type CustomDropdownProps = DropDownPickerProps<string> & {
  containerStyle?: StyleProp<ViewStyle>;
};

const CustomDropdown = (props: CustomDropdownProps) => {
  return (
    <View style={[styles.wrapper, props.containerStyle]}> 
      <DropDownPicker<string>
        {...props} 
        
        listMode="SCROLLVIEW"
        style={[styles.dropdownButton, props.style]}
        
        textStyle={styles.textStyle} 
        
        dropDownContainerStyle={styles.dropdownListContainer}
        listItemLabelStyle={styles.dropdownListItemText}
        selectedItemContainerStyle={styles.dropdownSelectedContainer}
        selectedItemLabelStyle={styles.dropdownSelectedText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  dropdownButton: { backgroundColor: '#E0ECFF', borderRadius: 8, borderWidth: 0, paddingHorizontal: 16, height: 50 },
  // ⬇️ (นี่คือชื่อ Style ที่ถูกต้อง ที่คุณตั้งไว้)
  textStyle: { color: '#074E9F', fontSize: 16, fontWeight: '500' },
  dropdownListContainer: { backgroundColor: '#FFF', borderColor: '#074E9F', borderWidth: 1, borderRadius: 8, marginTop: 8 },
  dropdownListItemText: { color: '#074E9F', fontSize: 16, paddingLeft: 10 },
  dropdownSelectedContainer: { backgroundColor: '#074E9F', borderRadius: 8 },
  dropdownSelectedText: { color: '#FFF', fontSize: 16, fontWeight: '600', paddingLeft: 10 },
});

export default CustomDropdown;