import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}));

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}));

type TimePickerProps = {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
};

export function TimePicker({ hour, minute, onHourChange, onMinuteChange, textColor, backgroundColor, borderColor }: TimePickerProps) {
  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <WheelPicker
        data={HOURS}
        value={hour}
        onValueChanged={({ item }: { item: { value: number } }) => onHourChange(item.value)}
        width={56}
        itemHeight={32}
        visibleItemCount={3}
        itemTextStyle={{ fontSize: 16, color: textColor }}
      />
      <Text style={[styles.separator, { color: textColor }]}>:</Text>
      <WheelPicker
        data={MINUTES}
        value={minute}
        onValueChanged={({ item }: { item: { value: number } }) => onMinuteChange(item.value)}
        width={56}
        itemHeight={32}
        visibleItemCount={3}
        itemTextStyle={{ fontSize: 16, color: textColor }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  separator: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 2,
  },
});
