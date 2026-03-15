interface GradeBadgeProps {
  grade: 'A' | 'B' | 'C';
  size?: 'sm' | 'lg';
}

export default function GradeBadge({ grade, size = 'lg' }: GradeBadgeProps) {
  const colorClass =
    grade === 'A'
      ? 'bg-grade-a text-primary-foreground'
      : grade === 'B'
      ? 'bg-grade-b text-primary-foreground'
      : 'bg-grade-c text-primary-foreground';

  const sizeClass = size === 'lg' ? 'h-24 w-24 text-5xl' : 'h-8 w-8 text-base';

  return (
    <div className={`flex items-center justify-center rounded-lg font-bold ${colorClass} ${sizeClass}`}>
      {grade}
    </div>
  );
}
