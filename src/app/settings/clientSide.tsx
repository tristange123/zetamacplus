"use client";

import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
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
        <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-2xl items-center px-4 py-10 md:px-6">
            <section className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 p-6 shadow-sm md:p-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Settings</h1>
                        <SettingsIcon size={24} className="text-gray-600" aria-hidden="true" />
                    </div>
                   
                </div>

                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-4">
                    {settingOptions.map((option) => (
                        <label
                            key={option.key}
                            className="flex cursor-pointer items-center justify-between gap-6 py-5"
                        >
                            <span>
                                <span className="block font-medium text-gray-800">{option.label}</span>
                                <span className="mt-1 block text-sm text-gray-500">{option.description}</span>
                            </span>
                            <span className="relative shrink-0">
                                <input
                                    type="checkbox"
                                    checked={settings[option.key]}
                                    onChange={(event) => updateSetting(option.key, event.target.checked)}
                                    className="peer sr-only"
                                />
                                <span className="block h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-gray-800 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-600" />
                                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                            </span>
                        </label>
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-end gap-4">
                    <p className="text-sm" aria-live="polite">
                        {saveStatus === "saved" && (
                            <span className="text-green-700">Settings saved.</span>
                        )}
                        {saveStatus === "error" && (
                            <span className="text-red-700">Could not save settings.</span>
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={saveSettings}
                        disabled={saveStatus === "saving"}
                        className="rounded-lg bg-gray-800 px-6 py-3 font-semibold text-gray-100 shadow-sm transition hover:bg-gray-900 disabled:cursor-wait disabled:opacity-60"
                    >
                        {saveStatus === "saving" ? "Saving..." : "Save"}
                    </button>
                </div>
            </section>
        </main>
    );
}
