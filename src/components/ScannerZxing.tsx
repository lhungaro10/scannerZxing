import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {  OrientationLocker } from 'react-native-orientation-locker';
import { Camera, useCameraDevice, useCameraPermission, type CameraDeviceFormat, useFrameProcessor } from 'react-native-vision-camera';
import { CodebarMask } from './CodebarMask';
import { barcodeToDigitableLine } from '../utils/boleto';
import { zxing } from 'vision-camera-zxing';
import { Worklets } from 'react-native-worklets-core';


type ScannerZxingProps = {
    onClose: () => void;
    isPortrait?: boolean;
};

export const ScannerZxing = ({ onClose, isPortrait = false }: ScannerZxingProps) => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const orientation = isPortrait ? 'portrait' : 'landscape-right'; // ou 'landscape-left' dependendo do lado
    const lastScannedValue = useRef<string | null>(null);
    const format: CameraDeviceFormat | undefined = useMemo(() => {
        if (!device) return undefined;
        // Pick a format that supports higher fps (30) and prefers higher resolution for better quality.
        const formats = device.formats
            .filter(f => f.maxFps >= 30 && f.minFps <= 30 && f.videoWidth != null && f.videoHeight != null)
            .sort((a, b) => {
                // Prioritize higher video resolution (width * height)
                const areaA = (a.videoWidth ?? 0) * (a.videoHeight ?? 0);
                const areaB = (b.videoWidth ?? 0) * (b.videoHeight ?? 0);
                return areaB - areaA;
            });
        return formats[0] ?? device.formats[0]; // Fallback to first available format
    }, [device]);

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission, requestPermission]);


    const handleBarcodeDetected = (barcodeText: string) : void => {
        Alert.alert('Código Escaneado', `Código: ${barcodeToDigitableLine(barcodeText)}`, [
            {
                text: 'OK',
                onPress: () => {
                    lastScannedValue.current = null;
                },
            },
        ]);
    };

    const executeHandleBarcodeDetectedJS = Worklets.createRunOnJS(handleBarcodeDetected)

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        console.log('Frame orientation:', frame.orientation);
        const barcodes = zxing(frame, { multiple: false });
        if (Array.isArray(barcodes) && barcodes.length <= 0) {
            return;
        }
        const barcode = barcodes[0];
        if (barcode.barcodeFormat !== 'ITF') {
            return;
        }

        console.log('Barcodes detected in frame processor:', barcode.barcodeText);
        lastScannedValue.current = barcode.barcodeText;

        // Chamar runOnJS para executar funções JavaScript normais fora do worklet
        executeHandleBarcodeDetectedJS(barcode.barcodeText);
    }, []);

    if (!hasPermission || !device) {
        return (
            <View style={styles.centeredFallback}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.fallbackText}>Inicializando câmera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <OrientationLocker orientation={'PORTRAIT'} />
            <Camera
                format={format}
                fps={10}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive
                frameProcessor={frameProcessor}
                outputOrientation='preview'
            />
            <CodebarMask />

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeLabel}>Fechar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 999,
    },
    closeLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    centeredFallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    fallbackText: {
        marginTop: 12,
        color: '#fff',
        fontSize: 16,
    },
});

