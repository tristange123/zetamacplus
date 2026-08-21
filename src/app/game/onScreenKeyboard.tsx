'use client'

import { Delete } from 'lucide-react';
import { useEffect, useState } from 'react';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const KEYPAD_ROWS = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
] as const;
const BACKSPACE = 'Backspace';

type OnScreenKeyboardProps = {
    onDigit: (digit: string) => void,
    onBackspace: () => void
}

export default function OnScreenKeyboard({onDigit, onBackspace}: OnScreenKeyboardProps) {
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);

    useEffect(() => {
        function trackedKey(event: KeyboardEvent) {
            if (event.key === BACKSPACE) return BACKSPACE;
            return DIGITS.includes(event.key) ? event.key : null;
        }

        function handleKeyDown(event: KeyboardEvent) {
            const key = trackedKey(event);
            if (key == null) return;
            setPressedKeys((keys) => (keys.includes(key) ? keys : [...keys, key]));
        }

        function handleKeyUp(event: KeyboardEvent) {
            const key = trackedKey(event);
            if (key == null) return;
            setPressedKeys((keys) => keys.filter((pressed) => pressed !== key));
        }

        // Key releases outside the tab never fire, so drop the highlight on blur.
        function clearPressedKeys() {
            setPressedKeys([]);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', clearPressedKeys);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', clearPressedKeys);
        };
    }, []);

    function keyClassName(key: string, extra = '') {
        const isPressed = pressedKeys.includes(key);
        return `flex h-12 items-center justify-center rounded-md border text-lg font-medium transition md:h-14 md:text-xl ${extra} ${
            isPressed
                ? 'border-gray-300 bg-gray-300 text-gray-600'
                : 'border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`;
    }

    return (
        <div className="mx-auto mt-10 grid w-full max-w-[16.5rem] grid-cols-3 gap-2 px-4 md:mt-14 md:max-w-[18.5rem] md:gap-3 md:px-6">
            {KEYPAD_ROWS.flatMap((row) => row.map((digit) => (
                <button
                    key={digit}
                    type="button"
                    onClick={() => onDigit(digit)}
                    className={keyClassName(digit)}
                >
                    {digit}
                </button>
            )))}
            <button
                type="button"
                onClick={() => onDigit('0')}
                className={keyClassName('0', 'col-span-2')}
            >
                0
            </button>
            <button
                type="button"
                aria-label="Backspace"
                onClick={onBackspace}
                className={keyClassName(BACKSPACE)}
            >
                <Delete size={20} aria-hidden="true" />
            </button>
        </div>
    );
}
