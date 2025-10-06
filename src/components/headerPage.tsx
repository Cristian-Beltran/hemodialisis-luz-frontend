interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  actions,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {children && <div className="px-6 pb-4">{children}</div>}
        </div>
        {actions && (
          <div className="ml-auto flex items-center space-x-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
