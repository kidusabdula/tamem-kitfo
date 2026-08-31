import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Contrast notes, because the palette makes this non-obvious:
 *
 * - `accent` is the true logo orange. White text on it is only 2.46:1, so it
 *   carries near-black espresso text instead — 5.66:1, comfortably AA.
 * - `primary` is deep brown with cream text, ~13:1.
 * - Orange is NEVER used as a text colour here. Where orange type is needed
 *   (prices, eyebrows) the darker `accent-ink` token is used instead.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
    'transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-soft)] ' +
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ' +
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        accent:
          'bg-accent text-accent-foreground shadow-[var(--shadow-card)] hover:bg-accent-hover hover:shadow-[var(--shadow-lift)]',
        primary: 'bg-brown-800 text-cream-100 hover:bg-brown-700',
        outline:
          'border border-brown-300 bg-transparent text-brown-800 hover:border-brown-800 hover:bg-brown-800 hover:text-cream-100',
        ghost: 'text-brown-700 hover:bg-brown-100 hover:text-brown-900',
        // For placement over photographs, where the scrim guarantees contrast.
        onPhoto:
          'border border-cream-100/40 bg-cream-100/10 text-cream-50 backdrop-blur-sm hover:bg-cream-50 hover:text-brown-900',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-11 px-6 text-[0.9375rem] [&_svg]:size-4',
        lg: 'h-13 px-8 text-base [&_svg]:size-5',
        icon: 'size-10 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'accent', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
