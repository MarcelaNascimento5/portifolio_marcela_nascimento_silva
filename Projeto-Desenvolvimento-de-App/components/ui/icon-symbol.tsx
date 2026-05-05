// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "person.2.fill": "group",
  "clock.fill": "history",
  "person.fill": "person",
  // Actions
  "paperplane.fill": "send",
  "video.fill": "videocam",
  "video.slash.fill": "videocam-off",
  "mic.fill": "mic",
  "mic.slash.fill": "mic-off",
  "phone.down.fill": "call-end",
  "shuffle": "shuffle",
  "star.fill": "star",
  "star": "star-border",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "arrow.left": "arrow-back",
  "chevron.right": "chevron-right",
  "chevron.left.forwardslash.chevron.right": "code",
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "bolt.fill": "bolt",
  "trophy.fill": "emoji-events",
  "dumbbell.fill": "fitness-center",
  "heart.fill": "favorite",
  "calendar": "calendar-today",
  "clock": "access-time",
  "info.circle": "info",
  "xmark": "close",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
