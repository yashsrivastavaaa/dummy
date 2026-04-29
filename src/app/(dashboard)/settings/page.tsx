"use client";

import { useEffect, useState } from "react";

type SettingsState = {
  emailAlerts: boolean;
  pushAlerts: boolean;
  weeklySummary: boolean;
  compactMode: boolean;
  showAvatars: boolean;
};

const defaultSettings: SettingsState = {
  emailAlerts: true,
  pushAlerts: true,
  weeklySummary: false,
  compactMode: false,
  showAvatars: true,
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("schoolama-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SettingsState;
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        setSettings(defaultSettings);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("schoolama-settings", JSON.stringify(settings));
    }
  }, [isLoaded, settings]);

  const updateSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const SettingToggle = ({
    id,
    label,
    description,
  }: {
    id: keyof SettingsState;
    label: string;
    description: string;
  }) => (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => updateSetting(id)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          settings[id] ? "bg-lamaSky" : "bg-gray-200"
        }`}
        aria-pressed={settings[id]}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
            settings[id] ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Settings</h1>
          <button
            type="button"
            onClick={resetSettings}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md">
        <h2 className="text-sm font-semibold text-gray-700">Notifications</h2>
        <div className="mt-2">
          <SettingToggle
            id="emailAlerts"
            label="Email alerts"
            description="Receive important updates by email."
          />
          <SettingToggle
            id="pushAlerts"
            label="Push alerts"
            description="Get in-app notifications for new events."
          />
          <SettingToggle
            id="weeklySummary"
            label="Weekly summary"
            description="A weekly digest of classes, exams, and announcements."
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-md">
        <h2 className="text-sm font-semibold text-gray-700">Appearance</h2>
        <div className="mt-2">
          <SettingToggle
            id="compactMode"
            label="Compact layout"
            description="Reduce spacing across lists and cards."
          />
          <SettingToggle
            id="showAvatars"
            label="Show avatars"
            description="Display profile images where available."
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
