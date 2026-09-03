'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckIcon, CircleDotIcon } from 'lucide-react';
import { MODULE_STEPS, usePlannerStore } from '../store/usePlannerStore';

export function PipelineIndicator() {
  const { completed, result } = usePlannerStore();
  const pathname = usePathname();
  const hasRun = Boolean(result);

  return (
    <nav
      aria-label="Trip planning progress"
      className="border-b border-line bg-surface/80 backdrop-blur"
    >
      <ol className="mx-auto flex max-w-7xl items-stretch gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {MODULE_STEPS.map((step, index) => {
          const isActive = pathname === step.path;
          const isDone = completed.includes(step.key) && !isActive;
          const enabled = hasRun;
          const content = (
            <span
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150 ease-out ${
                isActive
                  ? 'bg-forest-700 text-white'
                  : isDone
                  ? 'text-forest-700 hover:bg-forest-50'
                  : enabled
                  ? 'text-ink-muted hover:bg-canvas'
                  : 'text-ink-soft'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  isActive
                    ? 'border-white/40 bg-white/15 text-white'
                    : isDone
                    ? 'border-forest-600 bg-forest-600 text-white'
                    : 'border-line text-ink-soft'
                }`}
              >
                {isDone ? (
                  <CheckIcon className="h-3 w-3" aria-hidden />
                ) : isActive ? (
                  <CircleDotIcon className="h-3 w-3" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span className="whitespace-nowrap font-medium">{step.title}</span>
            </span>
          );

          return (
            <li key={step.key} className="flex items-center">
              {enabled ? (
                <Link href={step.path} aria-current={isActive ? 'step' : undefined}>
                  {content}
                </Link>
              ) : (
                <span aria-disabled>{content}</span>
              )}
              {index < MODULE_STEPS.length - 1 ? (
                <span aria-hidden className="mx-1 h-px w-4 shrink-0 bg-line sm:w-6" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
