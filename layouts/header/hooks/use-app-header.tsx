import { useNavigation } from "expo-router";

export function useAppHeader() {
  const navigation = useNavigation();

  function setHeaderRight(headerRight: React.ReactNode) {
    navigation.setOptions({
      headerRight: () => headerRight,
    });
  }
  function resetHeaderRight() {
    navigation.setOptions({
      headerRight: undefined,
    });
  }

  return {
    setHeaderRight,
    resetHeaderRight,
  };
}
