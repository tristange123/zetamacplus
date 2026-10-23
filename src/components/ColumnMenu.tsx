'use client'

import {Check, ChevronDown, type LucideIcon} from 'lucide-react';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

export type ColumnMenuProps = {
    label: string,
    active: boolean,
    indicator?: ReactNode,
    children: ReactNode,
}

// Column header button that opens a popover. The popover is portaled so the
// table's scroll container doesn't clip it.
export function ColumnMenu({label, active, indicator, children}: ColumnMenuProps) {
    const [position, setPosition] = useState<{top: number, left: number} | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isOpen = position != null;

    useEffect(() => {
        if (!isOpen) return;
        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
            setPosition(null);
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setPosition(null);
                buttonRef.current?.focus();
            }
        }
        function handleScroll(event: Event) {
            if (menuRef.current?.contains(event.target as Node)) return;
            setPosition(null);
        }
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    function toggle() {
        if (isOpen || !buttonRef.current) {
            setPosition(null);
            return;
        }
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 208;
        setPosition({
            top: rect.bottom + 6,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
        });
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggle}
                aria-haspopup="true"
                aria-expanded={isOpen}
                className={`-mx-2 inline-flex items-center gap-1 rounded-md px-2 py-1 uppercase tracking-wider transition ${
                    isOpen
                        ? 'bg-gray-200 text-gray-900'
                        : active
                            ? 'text-gray-900 hover:bg-gray-200'
                            : 'hover:bg-gray-200 hover:text-gray-800'
                }`}
            >
                {label}
                {indicator}
                <ChevronDown
                    className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{top: position.top, left: position.left}}
                    className="fixed z-50 w-52 rounded-lg border border-gray-200 bg-white p-1.5 text-sm normal-case tracking-normal shadow-lg ring-1 ring-black/5"
                >
                    {children}
                </div>,
                document.body,
            )}
        </>
    );
}

export function MenuSectionLabel({children}: {children: ReactNode}) {
    return (
        <p className="px-2 pb-1 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-400">
            {children}
        </p>
    );
}

type MenuCheckboxProps = {
    checked: boolean,
    onChange: () => void,
    icon?: LucideIcon,
    children: ReactNode,
}

export function MenuCheckbox({checked, onChange, icon: Icon, children}: MenuCheckboxProps) {
    return (
        <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-gray-700 transition hover:bg-gray-100">
            <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-gray-300 ${
                    checked ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white'
                }`}
                aria-hidden="true"
            >
                {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            {Icon && <Icon className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />}
            <span className="capitalize">{children}</span>
        </label>
    );
}
