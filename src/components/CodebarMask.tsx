import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

type CodebarMaskProps = {
  width?: number;
  height?: number;
  label?: string;
};

export const CodebarMask = ({
  width,
  height,
  label = 'Aponte o código aqui',
}: CodebarMaskProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // --- ALTERAÇÃO AQUI ---
  // Aumentamos as dimensões para ficarem próximas à borda.
  
  // defaultWidth controla a "altura" visual do box (quando o celular está deitado).
  // 70% da largura da tela em pé cria uma abertura bem generosa.
  const defaultWidth = screenWidth * 0.3; 

  // defaultHeight controla a "largura" visual do box (o comprimento do código de barras).
  // 90% da altura da tela faz ele ir quase de ponta a ponta na vertical (que vira horizontal).
  const defaultHeight = screenHeight * 0.9; 
  // ----------------------

  const boxWidth = Math.min(width ?? defaultWidth, screenWidth * 0.95);
  const boxHeight = Math.min(height ?? defaultHeight, screenHeight * 0.95);

  const horizontal = (screenWidth - boxWidth) / 2;
  const vertical = (screenHeight - boxHeight) / 2;

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: vertical }]} />
      <View style={[styles.overlay, { top: vertical, left: 0, width: horizontal, height: boxHeight }]} />
      <View style={[styles.overlay, { top: vertical, right: 0, width: horizontal, height: boxHeight }]} />
      <View style={[styles.overlay, { bottom: 0, left: 0, right: 0, height: vertical }]} />

      <View style={[styles.window, { width: boxWidth, height: boxHeight, top: vertical, left: horizontal }]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {label ? (
        <View style={styles.labelContainer}>
          <Text style={styles.labelRotated}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
};

const BORDER = 4;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  window: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#00E0A1',
  },
  topLeft: {
    top: -BORDER,
    left: -BORDER,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -BORDER,
    right: -BORDER,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -BORDER,
    left: -BORDER,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -BORDER,
    right: -BORDER,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
    borderBottomRightRadius: 10,
  },
  labelContainer: {
    position: 'absolute',
    // MUDANÇA 1: De 'right: 0' para 'left: 0'
    // Isso coloca o texto na borda esquerda (que vira o "fundo" no Landscape Right)
    left: 0, 
    top: 0,
    bottom: 0,
    width: 60, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  labelRotated: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: 300,
    // MUDANÇA 2: De '90deg' para '-90deg'
    // Isso rotaciona o texto para ficar legível quando o topo do celular está à direita
    transform: [{ rotate: '-90deg' }], 
    
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
});