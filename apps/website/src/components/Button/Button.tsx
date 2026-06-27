import type { FC } from 'react';
import styles from './Button.module.scss';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'primaryFilled' | 'secondaryOutlined';
}

export const Button: FC<ButtonProps> = ({ children, onClick, variant, className, ...props }) => {
    return (
        <button className={clsx(styles.button, styles[variant], className)} {...props}>
            {children}
        </button>
    );
};