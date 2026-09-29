import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-stone-800">{title}</p>
        {description && <p className="max-w-sm text-sm text-stone-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
