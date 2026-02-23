'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface WizardStep {
  label: string;
  description?: string;
}

export interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  children: React.ReactNode;
  className?: string;
}

function StepWizard({ steps, currentStep, children, className = '' }: StepWizardProps) {
  return (
    <div className={className}>
      <nav aria-label="Progress steps">
        <ol className="flex items-center gap-2 mb-8" role="list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li key={step.label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                          ? 'border-2 border-blue-600 text-blue-600'
                          : 'border-2 border-gray-300 text-gray-400'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-xs text-gray-500 truncate">{step.description}</p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div role="region" aria-label={`Step ${currentStep + 1}: ${steps[currentStep]?.label}`}>
        {children}
      </div>
    </div>
  );
}

export { StepWizard };
