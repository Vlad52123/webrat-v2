"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePanelSettings } from "../settings";
import { ChangePasswordModal } from "../settings/modals/change-password-modal";
import { DeleteAccountModal } from "../settings/modals/delete-account-modal";
import { LogoutModal } from "../settings/modals/logout-modal";
import { SetEmailModal } from "../settings/modals/set-email-modal";
import { csrfHeaders } from "../builder/utils/csrf";
import { PersonalizationPane } from "../settings/panes/personalization-pane";
import { SecurityPane } from "../settings/panes/security-pane";
import type { SettingsTabKey } from "../state/settings-tab";
import { useSecurityInfo } from "./use-security-info";
import { useWsMenuPosition } from "./use-ws-menu-position";
import { logoutAndRedirect } from "./settings-actions/logout";
import { deleteAccountAction } from "./settings-actions/delete-account";
import { changePasswordAction } from "./settings-actions/change-password";
import { setEmailConfirmAction } from "./settings-actions/email";

export function SettingsScreen(props: { tab: SettingsTabKey }) {
   const { tab } = props;
   const {
      state,
      setBgMode,
      setBgImageFromFile,
      setBgVideoFromFile,
      setBgColor,
      setLineColor,
      setSnow,
      setRgb,
      setSoundVolume,
      setWsHost,
      reapply,
   } = usePanelSettings();

   const { securityLogin, securitySubDisplay, securityEmail, securityRegDate } = useSecurityInfo();
   const [logoutOpen, setLogoutOpen] = useState(false);
   const [deleteOpen, setDeleteOpen] = useState(false);
   const [deletePwd, setDeletePwd] = useState("");
   const [deleteErr, setDeleteErr] = useState("");
   const [passwordOpen, setPasswordOpen] = useState(false);
   const [passwordSaving, setPasswordSaving] = useState(false);
   const [passwordOld, setPasswordOld] = useState("");
   const [passwordNew, setPasswordNew] = useState("");
   const [passwordNewAgain, setPasswordNewAgain] = useState("");
   const [emailOpen, setEmailOpen] = useState(false);
   const [emailNew, setEmailNew] = useState("");
   const [emailPasswordOrCode, setEmailPasswordOrCode] = useState("");
   const [emailStep, setEmailStep] = useState<"input" | "code">("input");
   const [pendingEmail, setPendingEmail] = useState("");

   const wsSelectValue = useMemo(() => state.wsHost || "__default__", [state.wsHost]);

   const { wsWrapRef, wsBtnRef, wsMenuRef, wsOpen, setWsOpen, wsMenuPos } = useWsMenuPosition();

   const reapplyRef = useRef(reapply);
   useEffect(() => {
      reapplyRef.current = reapply;
   }, [reapply]);

   useEffect(() => {
      const id = window.requestAnimationFrame(() => {
         void reapplyRef.current();
      });
      return () => window.cancelAnimationFrame(id);
   }, [tab]);

   useEffect(() => {
      if (!logoutOpen && !deleteOpen && !passwordOpen && !emailOpen) return;
      const onKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            setLogoutOpen(false);
            setDeleteOpen(false);
            setPasswordOpen(false);
            setEmailOpen(false);
         }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
   }, [deleteOpen, emailOpen, logoutOpen, passwordOpen]);

   return (
      <div id="settingsView" className="flex h-full flex-col overflow-auto">
         <div className="flex-1 min-h-0 p-[10px]">
            <div className="w-[920px] max-w-[min(980px,calc(100vw-60px))] mx-auto mt-[22px] px-[10px] pb-[10px] min-h-[220px]">
               <PersonalizationPane
                  tab={tab}
                  state={state}
                  setBgMode={setBgMode}
                  setBgImageFromFile={setBgImageFromFile}
                  setBgVideoFromFile={setBgVideoFromFile}
                  setBgColor={setBgColor}
                  setLineColor={setLineColor}
                  setSnow={setSnow}
                  setRgb={setRgb}
                  setSoundVolume={setSoundVolume}
                  setWsHost={setWsHost}
                  wsSelectValue={wsSelectValue}
                  wsWrapRef={wsWrapRef}
                  wsBtnRef={wsBtnRef}
                  wsMenuRef={wsMenuRef}
                  wsOpen={wsOpen}
                  setWsOpen={setWsOpen}
                  wsMenuPos={wsMenuPos}
               />

               <SecurityPane
                  tab={tab}
                  securityLogin={securityLogin}
                  securitySub={securitySubDisplay}
                  securityEmail={securityEmail}
                  securityRegDate={securityRegDate}
                  onOpenPassword={() => {
                     setPasswordOld("");
                     setPasswordNew("");
                     setPasswordNewAgain("");
                     setPasswordOpen(true);
                  }}
                  onOpenEmail={() => {
                     setEmailStep("input");
                     setPendingEmail("");
                     setEmailNew("");
                     setEmailPasswordOrCode("");
                     setEmailOpen(true);
                  }}
                  onOpenLogout={() => setLogoutOpen(true)}
                  onOpenDelete={() => {
                     setDeleteErr("");
                     setDeletePwd("");
                     setDeleteOpen(true);
                  }}
               />
            </div>
         </div>

         <LogoutModal
            open={logoutOpen}
            onClose={() => setLogoutOpen(false)}
            onLogout={() => {
               void logoutAndRedirect();
            }}
         />

         <DeleteAccountModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            password={deletePwd}
            setPassword={setDeletePwd}
            error={deleteErr}
            setError={setDeleteErr}
            onConfirm={(pwd) => {
               void deleteAccountAction(pwd, {
                  setError: setDeleteErr,
                  setOpen: setDeleteOpen,
               });
            }}
         />

         <ChangePasswordModal
            open={passwordOpen}
            onClose={() => setPasswordOpen(false)}
            isLoading={passwordSaving}
            oldPassword={passwordOld}
            setOldPassword={setPasswordOld}
            newPassword={passwordNew}
            setNewPassword={setPasswordNew}
            newPasswordAgain={passwordNewAgain}
            setNewPasswordAgain={setPasswordNewAgain}
            onConfirm={() => {
               void changePasswordAction({
                  passwordSaving,
                  setPasswordSaving,
                  passwordOld,
                  passwordNew,
                  passwordNewAgain,
                  setPasswordOpen,
               });
            }}
         />

         <SetEmailModal
            open={emailOpen}
            onClose={() => setEmailOpen(false)}
            email={emailNew}
            setEmail={setEmailNew}
            passwordOrCode={emailPasswordOrCode}
            setPasswordOrCode={setEmailPasswordOrCode}
            step={emailStep}
            onConfirm={() => {
               void setEmailConfirmAction({
                  emailNew,
                  emailPasswordOrCode,
                  emailStep,
                  pendingEmail,
                  setPendingEmail,
                  setEmailStep,
                  setEmailPasswordOrCode: setEmailPasswordOrCode,
                  setEmailOpen,
               });
            }}
         />
      </div>
   );
}