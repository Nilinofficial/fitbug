import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";

type ToastProps = {
    visible: boolean;
    message: string;
    onHide: () => void;
    duration?: number;
};

const Toast = ({ visible, message, onHide, duration = 2200 }: ToastProps) => {
    const { colors } = useAppTheme();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        if (!visible) return;

        opacity.setValue(0);
        translateY.setValue(12);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
        }, duration);

        return () => clearTimeout(timer);
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 100,
                opacity,
                transform: [{ translateY }],
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    alignSelf: "center",
                    backgroundColor: colors.textPrimary,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 6,
                }}
            >
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                <Text style={{ color: colors.background, fontSize: 13, fontFamily: Fonts.medium }}>
                    {message}
                </Text>
            </View>
        </Animated.View>
    );
};

export default Toast;
