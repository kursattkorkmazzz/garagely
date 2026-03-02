import React, { useState, useCallback, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { useI18n } from "@/hooks/use-i18n";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

export type WizardStep = {
  id: string;
  title?: string;
  subtitle?: string;
  content: ReactNode;
  canProceed?: boolean | (() => boolean | Promise<boolean>);
  onNext?: () => void | Promise<void>;
  onBack?: () => void;
};

type AppWizardProps = {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  showProgress?: boolean;
  showStepTitle?: boolean;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  cancelLabel?: string;
};

export function AppWizard({
  steps,
  onComplete,
  onCancel,
  showProgress = true,
  showStepTitle = true,
  nextLabel,
  backLabel,
  completeLabel,
  cancelLabel,
}: AppWizardProps) {
  const { theme, withOpacity } = useTheme();
  const { t } = useI18n();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const _nextLabel = nextLabel || t("common:buttons.next");
  const _backLabel = backLabel || t("common:buttons.back");
  const _completeLabel = completeLabel || t("common:buttons.done");
  const _cancelLabel = cancelLabel || t("common:buttons.cancel");

  const canProceed = useCallback(async (): Promise<boolean> => {
    if (currentStep.canProceed === undefined) return true;
    if (typeof currentStep.canProceed === "boolean") return currentStep.canProceed;
    return await currentStep.canProceed();
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const canGo = await canProceed();
      if (!canGo) {
        setIsLoading(false);
        return;
      }

      if (currentStep.onNext) {
        await currentStep.onNext();
      }

      if (isLastStep) {
        onComplete();
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [canProceed, currentStep, isLastStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep.onBack) {
      currentStep.onBack();
    }

    if (isFirstStep) {
      onCancel?.();
    } else {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStep, isFirstStep, onCancel]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      {showProgress && steps.length > 1 && (
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index <= currentStepIndex
                        ? theme.primary
                        : withOpacity(theme.muted, 0.3),
                  },
                ]}
              />
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    {
                      backgroundColor:
                        index < currentStepIndex
                          ? theme.primary
                          : withOpacity(theme.muted, 0.3),
                    },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Step Title */}
      {showStepTitle && (currentStep.title || currentStep.subtitle) && (
        <View style={styles.titleContainer}>
          {currentStep.title && (
            <AppText variant="heading2" style={styles.title}>
              {currentStep.title}
            </AppText>
          )}
          {currentStep.subtitle && (
            <AppText variant="bodyMedium" color="muted" style={styles.subtitle}>
              {currentStep.subtitle}
            </AppText>
          )}
        </View>
      )}

      {/* Step Content */}
      <View style={styles.content}>{currentStep.content}</View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <AppButton
          variant="ghost"
          onPress={handleBack}
          style={styles.backButton}
        >
          {isFirstStep ? (
            _cancelLabel
          ) : (
            <View style={styles.buttonContent}>
              <AppIcon icon="ChevronLeft" size={18} color={theme.foreground} />
              <AppText variant="bodyMedium">{_backLabel}</AppText>
            </View>
          )}
        </AppButton>

        <AppButton
          variant="primary"
          onPress={handleNext}
          loading={isLoading}
          style={styles.nextButton}
        >
          <View style={styles.buttonContent}>
            <AppText variant="bodyMedium" style={{ color: theme.primaryForeground }}>
              {isLastStep ? _completeLabel : _nextLabel}
            </AppText>
            {!isLastStep && (
              <AppIcon icon="ChevronRight" size={18} color={theme.primaryForeground} />
            )}
          </View>
        </AppButton>
      </View>
    </View>
  );
}

// Hook to control wizard from outside
export function useWizard(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const back = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    next,
    back,
    goTo,
    reset,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: spacing.xs,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
