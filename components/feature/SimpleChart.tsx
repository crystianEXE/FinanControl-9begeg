import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../constants/theme';
import { ChartData } from '../../services/materialService';

interface SimpleChartProps {
  data: ChartData[];
}

export function SimpleChart({ data }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartWidth = Math.max(1, Dimensions.get('window').width - (theme.spacing.md * 4));
  const barWidth = Math.max(1, chartWidth / data.length - theme.spacing.xs);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uso de Equipamentos (últimos 7 dias)</Text>
      
      <View style={styles.chart}>
        <View style={styles.bars}>
          {data.map((item, index) => {
            const height = Math.max(1, (item.value / maxValue) * 150);
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.bar, { height, width: barWidth }]} />
                <Text style={styles.label}>{item.date}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  chart: {
    height: 200,
    justifyContent: 'flex-end',
  },
  
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
  },
  
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  
  bar: {
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.xs,
    borderTopRightRadius: theme.borderRadius.xs,
    minHeight: 4,
  },
  
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
