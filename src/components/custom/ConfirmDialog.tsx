import { Modal, Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog = ({
    visible,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    destructive = true,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const { colors } = useAppTheme();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(32,36,45,0.4)",
                    justifyContent: "center",
                    paddingHorizontal: 24,
                }}
            >
                <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 14 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                        {title}
                    </Text>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 13,
                            fontFamily: Fonts.regular,
                            lineHeight: 19,
                        }}
                    >
                        {message}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                        <Pressable
                            onPress={onCancel}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: 12,
                                borderRadius: 30,
                                backgroundColor: colors.surfaceMuted,
                            }}
                        >
                            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                {cancelLabel}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            style={{
                                flex: 1,
                                alignItems: "center",
                                paddingVertical: 12,
                                borderRadius: 30,
                                backgroundColor: destructive ? "#e2703a" : "#1263df",
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                {confirmLabel}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmDialog;
