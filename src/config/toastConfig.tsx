//CONFIGURACIÓN DE LAS ALARMAS DE LA LIBRERÍA "TOAST"

import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { ToastConfig } from "react-native-toast-message";

export const customToastConfig: ToastConfig = {
  success: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      style={{"flexDirection":"row","alignItems":"center","backgroundColor":"#181c22","borderWidth":1,"borderColor":"#10b981","borderLeftWidth":4,"borderRadius":12,"width":"90%","padding":16}}
    >
      <MaterialIcons name="check-circle" size={24} color="#10b981" />
      <View style={{"marginLeft":12,"flex":1}}>
        <Text style={{"color":"#ffffff","fontWeight":"700","fontSize":14,"fontFamily":"monospace"}}>{text1}</Text>
        {text2 && <Text style={{"color":"#9ca3af","fontSize":12,"marginTop":2}}>{text2}</Text>}
      </View>
    </Pressable>
  ),

  error: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      style={{"flexDirection":"row","alignItems":"center","backgroundColor":"#181c22","borderWidth":1,"borderColor":"#f85149","borderLeftWidth":4,"borderRadius":12,"width":"90%","padding":16}}
    >
      <MaterialIcons name="error-outline" size={24} color="#f85149" />
      <View style={{"marginLeft":12,"flex":1}}>
        <Text style={{"color":"#ffffff","fontWeight":"700","fontSize":14,"fontFamily":"monospace"}}>{text1}</Text>
        {text2 && <Text style={{"color":"#9ca3af","fontSize":12,"marginTop":2}}>{text2}</Text>}
      </View>
    </Pressable>
  ),

  info: ({ text1, text2, onPress }) => (
    <Pressable
      onPress={onPress}
      style={{"flexDirection":"row","alignItems":"center","backgroundColor":"#181c22","borderWidth":1,"borderColor":"#3b82f6","borderLeftWidth":4,"borderRadius":12,"width":"90%","padding":16}}
    >
      <MaterialIcons name="info-outline" size={24} color="#3b82f6" />
      <View style={{"marginLeft":12,"flex":1}}>
        <Text style={{"color":"#ffffff","fontWeight":"700","fontSize":14,"fontFamily":"monospace"}}>{text1}</Text>
        {text2 && <Text style={{"color":"#9ca3af","fontSize":12,"marginTop":2}}>{text2}</Text>}
      </View>
    </Pressable>
  ),
};
