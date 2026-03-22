import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#6d28d9] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-violet-100 text-violet-900 hover:bg-violet-100/80',
        secondary:
          'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80',
        success:
          'border-transparent bg-emerald-100 text-emerald-900 hover:bg-emerald-100/80',
        warning:
          'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100/80',
        outline: 'border-slate-200 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
