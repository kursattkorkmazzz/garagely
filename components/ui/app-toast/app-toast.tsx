import { AppToastBase } from "@/components/ui/app-toast/components/app-toast-base";
import Toast, {
  type ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";

const GaragelyToastConfig: ToastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <AppToastBase {...props} type="success" />
  ),
  error: (props: ToastConfigParams<any>) => (
    <AppToastBase {...props} type="error" />
  ),
  warning: (props: ToastConfigParams<any>) => (
    <AppToastBase {...props} type="warning" />
  ),
  info: (props: ToastConfigParams<any>) => (
    <AppToastBase {...props} type="info" />
  ),
};

export function AppToast() {
  return (
    <Toast
      config={GaragelyToastConfig}
      autoHide
      visibilityTime={3000}
      position="top"
    />
  );
}
