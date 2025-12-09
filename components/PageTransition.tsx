import React from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    variant?: 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'morph';
    duration?: number;
    delay?: number;
    className?: string;
}

// Endel-style transitions: slow, calm, peaceful fades
// No movement, just opacity with gentle easing
const endelEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1]; // Smooth, calm bezier

const transitionVariants: Record<string, Variants> = {
    slide: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: endelEase
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.35,
                ease: endelEase
            }
        }
    },
    fade: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: endelEase
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.35,
                ease: endelEase
            }
        }
    },
    scale: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: endelEase
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.35,
                ease: endelEase
            }
        }
    },
    slideUp: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: endelEase
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    },
    slideDown: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    },
    morph: {
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1,
            transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    }
};

/**
 * PageTransition - Premium page transition wrapper
 * 
 * Usage:
 * <PageTransition variant="slide">
 *   <YourComponent />
 * </PageTransition>
 * 
 * Variants:
 * - slide: Horizontal slide with blur (best for main navigation)
 * - fade: Soft fade with subtle scale (best for modals/overlays)
 * - scale: Pop-in effect (best for tools/cards opening)
 * - slideUp: Bottom sheet style (best for modals)
 * - slideDown: Top dropdown style (best for notifications)
 * - morph: 3D perspective morph (best for dramatic transitions)
 */
const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    variant = 'slide',
    duration,
    delay = 0,
    className = ''
}) => {
    const variants = transitionVariants[variant];

    // Apply custom duration if provided
    const customVariants = duration ? {
        ...variants,
        animate: {
            ...variants.animate,
            transition: {
                ...(variants.animate as any).transition,
                duration
            }
        }
    } : variants;

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={customVariants}
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggeredContainer - Wrapper for staggered children animations
 */
interface StaggeredContainerProps {
    children: React.ReactNode;
    delay?: number;
    stagger?: number;
    className?: string;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
    children,
    delay = 0,
    stagger = 0.1,
    className = ''
}) => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: delay,
                staggerChildren: stagger
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * StaggeredItem - Individual item for staggered animations
 */
interface StaggeredItemProps {
    children: React.ReactNode;
    className?: string;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({
    children,
    className = ''
}) => {
    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 30
            }
        }
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
};

/**
 * FadeInView - Simple fade-in on scroll/mount
 */
interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    delay = 0,
    duration = 0.5,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay,
                duration,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/**
 * PulseGlow - Animated glow/pulse effect for highlights
 */
interface PulseGlowProps {
    children: React.ReactNode;
    color?: string;
    intensity?: 'low' | 'medium' | 'high';
    className?: string;
}

export const PulseGlow: React.FC<PulseGlowProps> = ({
    children,
    color = 'rgba(124, 58, 237, 0.5)',
    intensity = 'medium',
    className = ''
}) => {
    const intensityMap = {
        low: { scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] },
        medium: { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] },
        high: { scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }
    };

    return (
        <motion.div
            className={`relative ${className}`}
        >
            <motion.div
                animate={intensityMap[intensity]}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-inherit blur-xl -z-10"
                style={{ background: color }}
            />
            {children}
        </motion.div>
    );
};

export default PageTransition;
