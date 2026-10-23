"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useGameContext } from "../gameContext";

type UserSettings = {
    showScore: boolean;
    showTimer: boolean;
    showKeyboard: boolean;
};

type SettingsClientProps = {
    initialSettings: UserSettings;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const {
        setShowScore,
        setShowTimer,
        setShowKeyboard,
    } = useGameContext();

    function updateSetting(setting: keyof UserSettings, value: boolean) {
        setSettings((current) => ({
            ...current,
            [setting]: value,
        }));
        setSaveStatus("idle");
    }

    async function saveSettings() {
        setSaveStatus("saving");

        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error(`Settings request failed with ${response.status}`);
            }

            const savedSettings: UserSettings = await response.json();
            setSettings(savedSettings);
            setShowScore(savedSettings.showScore);
            setShowTimer(savedSettings.showTimer);
            setShowKeyboard(savedSettings.showKeyboard);
            setSaveStatus("saved");
        }
        catch (error) {
            console.error("Failed to save settings", error);
            setSaveStatus("error");
        }
    }

    const settingOptions: Array<{
        key: keyof UserSettings;
        label: string;
        description: string;
    }> = [
        {
            key: "showScore",
            label: "Show score",
            description: "Display your current score while playing.",
        },
        {
            key: "showTimer",
            label: "Show timer",
            description: "Display the remaining time during a game.",
        },
        {
            key: "showKeyboard",
            label: "Show keyboard",
            description: "Display the on-screen number keyboard.",
        },
    ];

    return (
        <section className="flex min-h-[calc(100vh-9rem)] justify-center pt-[8vh] md:pt-[10vh]">
            <div className="w-full max-w-xl px-3">
                <div className="border-b border-gray-200 pb-4 pt-2">
                    <h1 className="text-sm font-semibold text-gray-900 sm:text-base">Settings</h1>
                </div>

                <div className="divide-y divide-gray-200 border-b border-gray-200">
                    {settingOptions.map((option) => (
                        <label
                            key={option.key}
                            className="group flex cursor-pointer items-center justify-between gap-6 py-5"
                        >
                            <span>
                                <span className="block text-sm font-semibold text-gray-800">{option.label}</span>
                                <span className="mt-1 block text-xs text-gray-400">{option.description}</span>
                            </span>
                            <span className="relative flex shrink-0">
                                <input
                                    type="checkbox"
                                    checked={settings[option.key]}
                                    onChange={(event) => updateSetting(option.key, event.target.checked)}
                                    className="peer sr-only"
                                />
                                <span className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-transparent transition group-hover:border-gray-500 peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gray-300">
                                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                                </span>
                            </span>
                        </label>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-end gap-5">
                    <p className="text-xs" aria-live="polite">
                        {saveStatus === "saved" && (
                            <span className="text-gray-500">Settings saved.</span>
                        )}
                        {saveStatus === "error" && (
                            <span className="text-red-600">Could not save settings.</span>
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={saveSettings}
                        disabled={saveStatus === "saving"}
                        className="group flex items-center justify-center gap-3 rounded-md bg-gray-900 px-10 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
                    >
                        {saveStatus === "saving" ? "Saving..." : "Save"}
                        <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
