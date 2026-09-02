import React from 'react';
import { AlertTriangleIcon, ArrowRightIcon } from 'lucide-react';
import { PipelineIssue } from '../types/tourism';
import { ButtonLink } from './ui/Button';

export function PipelineIssueNotice({ issue }: { issue: PipelineIssue }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-2xl border border-alert-100 bg-alert-50 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-alert-500" aria-hidden />
        <div>
          <h2 className="text-base font-semibold text-alert-600">{issue.title}</h2>
          <p className="mt-1 text-sm text-alert-600/90">{issue.message}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-alert-600">
            Suggested adjustments
          </p>
          <ul className="mt-1.5 space-y-1">
            {issue.suggestions.map((suggestion) => (
              <li key={suggestion} className="flex gap-1.5 text-sm text-alert-600/90">
                <span aria-hidden>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
          <ButtonLink to="/planner" variant="secondary" size="sm" className="mt-4">
            Adjust preferences
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
