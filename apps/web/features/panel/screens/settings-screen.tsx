"use client";

import type { SettingsTabKey } from "../state/settings-tab";

export function SettingsScreen(props: { tab: SettingsTabKey }) {
  const { tab } = props;

  return (
    <div id="settingsView" className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-[min(980px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
        <div className="rounded-[18px] border border-white/15 bg-black/30 px-[10px] pb-[10px] pt-0 shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-md">
          <div
            className="mt-[2px] mb-3 ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/95"
            aria-hidden={tab !== "personalization"}
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            Personalization
          </div>
          <div
            className="mt-[2px] mb-3 ml-[2px] text-[18px] font-extrabold tracking-[0.02em] text-white/95"
            aria-hidden={tab !== "security"}
            style={{ display: tab === "security" ? "block" : "none" }}
          >
            Security
          </div>

          <div
            className="min-h-[220px]"
            data-settings-pane="personalization"
            style={{ display: tab === "personalization" ? "block" : "none" }}
          >
            <div className="grid gap-5">
              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Background</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                  <div className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        id="settingsBgGalleryBtn"
                        type="button"
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                      >
                        Gallery
                      </button>
                      <button
                        id="settingsBgVideoBtn"
                        type="button"
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                      >
                        Video
                      </button>
                      <button
                        id="settingsBgDefaultBtn"
                        type="button"
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                      >
                        Default
                      </button>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[12px] font-semibold text-white/70">Image</label>
                      <input
                        id="settingsBgFile"
                        type="file"
                        className="w-full rounded-[12px] border border-white/15 bg-black/30 px-3 py-2 text-[13px] text-white/85"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[12px] font-semibold text-white/70">Video</label>
                      <input
                        id="settingsBgVideoFile"
                        type="file"
                        className="w-full rounded-[12px] border border-white/15 bg-black/30 px-3 py-2 text-[13px] text-white/85"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[12px] font-semibold text-white/70">Color</label>
                      <input
                        id="settingsBgColor"
                        type="color"
                        className="h-[42px] w-[140px] rounded-[12px] border border-white/15 bg-black/30"
                      />
                    </div>
                  </div>

                  <div className="rounded-[14px] border border-white/10 bg-black/30 p-3">
                    <div className="mb-2 text-[12px] font-semibold text-white/70">Preview</div>
                    <div
                      id="settingsBgPreview"
                      className="h-[180px] w-full rounded-[12px] border border-white/10 bg-[#121212]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">UI</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-[12px] font-semibold text-white/70">Line color</label>
                    <div className="flex items-center gap-3">
                      <input
                        id="settingsLineColor"
                        type="color"
                        className="h-[42px] w-[140px] rounded-[12px] border border-white/15 bg-black/30"
                      />
                      <div
                        id="settingsLinePreview"
                        className="h-[10px] w-[120px] rounded-full border border-white/15 bg-[var(--line,#f069ec)]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[12px] font-semibold text-white/70">Sound</label>
                    <input
                      id="settingsSoundRange"
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={50}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="text-[13px] font-bold text-white/85">Snow</div>
                    <button
                      id="settingsSnowToggle"
                      type="button"
                      className="h-[28px] w-[56px] rounded-full border border-white/15 bg-white/5"
                      aria-pressed="false"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/30 px-4 py-3">
                    <div className="text-[13px] font-bold text-white/85">RGB line</div>
                    <button
                      id="settingsRgbToggle"
                      type="button"
                      className="h-[28px] w-[56px] rounded-full border border-white/15 bg-white/5"
                      aria-pressed="false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="min-h-[220px]"
            data-settings-pane="security"
            style={{ display: tab === "security" ? "block" : "none" }}
          >
            <div className="grid gap-4">
              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Account</div>
                <div className="grid gap-2 text-[13px] text-white/80">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Login</div>
                    <div id="securityLoginValue" className="font-bold text-white/90">
                      -
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Registration</div>
                    <div id="securityRegDateValue" className="font-bold text-white/90">
                      -
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white/70">Subscription</div>
                    <div id="securitySubValue" className="font-bold text-white/90">
                      -
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <div className="mb-3 text-[13px] font-extrabold text-white/90">Actions</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="securityLogoutBtn"
                    type="button"
                    className="rounded-[14px] border border-white/15 bg-black/30 px-4 py-2 text-[13px] font-bold text-white/85 hover:bg-white/10"
                  >
                    Logout
                  </button>
                  <button
                    id="securityDeleteBtn"
                    type="button"
                    className="rounded-[14px] border border-red-500/40 bg-red-500/10 px-4 py-2 text-[13px] font-bold text-red-100 hover:bg-red-500/15"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
