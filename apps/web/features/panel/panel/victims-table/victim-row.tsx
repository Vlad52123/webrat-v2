import Image from "next/image";
import { memo, useCallback, type MouseEvent, type MouseEventHandler } from "react";

import { cn } from "../../../../lib/utils";

import type { Victim } from "../../api/victims";
import { victimsColumnSizeClass, type VictimsColumnKey } from "./victims-columns";
import { countryCodeToFlagEmoji } from "../utils/country-flag";
import { getVictimDeviceIconSrc } from "../utils/victim-device-icon";
import { formatRam } from "../utils/format-ram";

import { formatTime, getLastActiveMs, isVictimOnline } from "../utils/victim-status";

function formatLastActive(victim: Victim): string {
    const ms = getLastActiveMs(victim);
    return ms ? formatTime(ms) : "";
}

type Props = {
    victim: Victim;
    columnOrder: VictimsColumnKey[];
    isSelected: boolean;
    onSelectVictim: (victimId: string) => void;
    onOpenDetail: (victimId: string) => void;
    onOpenContextMenu: (e: MouseEvent<HTMLTableRowElement>, victim: Victim, victimId: string) => void;
};

type InnerProps = {
    victim: Victim;
    columnOrder: VictimsColumnKey[];
    isSelected: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
    onContextMenu: MouseEventHandler<HTMLTableRowElement>;
};

function VictimRowInner(props: InnerProps) {
    const { victim: v, columnOrder, isSelected, onClick, onDoubleClick, onContextMenu } = props;

    const online = isVictimOnline(v);
    const id = String(v.id ?? "");
    const flag = countryCodeToFlagEmoji(v.country);

    const cellBase = "px-[8px] py-[4px] text-left whitespace-nowrap";

    const renderCell = (col: VictimsColumnKey) => {
        switch (col) {
            case "h-country":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase, "text-[18px]")}>
                        {flag || v.country || ""}
                    </td>
                );
            case "h-icon":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        <Image
                            className={cn(
                                "h-[36px] w-[36px] align-middle opacity-90",
                                "[filter:grayscale(1)_brightness(0.7)]",
                                online &&
                                "opacity-100 ![filter:brightness(0)_saturate(100%)_invert(36%)_sepia(99%)_saturate(4245%)_hue-rotate(306deg)_brightness(104%)_contrast(106%)]",
                            )}
                            src={getVictimDeviceIconSrc(v)}
                            alt="icon"
                            width={36}
                            height={36}
                            draggable={false}
                        />
                    </td>
                );
            case "h-user":
                return (
                    <td
                        key={col}
                        className={cn(col, victimsColumnSizeClass(col), cellBase, "font-normal text-white/[0.96]")}
                    >
                        {v.user ?? ""}
                    </td>
                );
            case "h-admin":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.admin ? "True" : "False"}
                    </td>
                );
            case "h-pc-name":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.hostname ?? ""}
                    </td>
                );
            case "h-window":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.window ?? ""}
                    </td>
                );
            case "h-last-active":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {formatLastActive(v)}
                    </td>
                );
            case "h-ip":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.ip ?? ""}
                    </td>
                );
            case "h-os":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.os ?? ""}
                    </td>
                );
            case "h-cpu":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.cpu ?? ""}
                    </td>
                );
            case "h-ram":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {formatRam(v.ram)}
                    </td>
                );
            case "h-gpu":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.gpu ?? ""}
                    </td>
                );
            case "h-comment":
                return (
                    <td key={col} className={cn(col, victimsColumnSizeClass(col), cellBase)}>
                        {v.comment ?? ""}
                    </td>
                );
            default:
                return null;
        }
    };

    return (
        <tr
            data-victim-id={id}
            className={cn(
                "border-b border-white/[0.04]",
                "hover:bg-white/[0.03]",
                isSelected && "bg-white/[0.04]",
            )}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
        >
            {columnOrder.map(renderCell)}
        </tr>
    );
}

export const VictimRow = memo(
    (props: Props) => {
        const { victim: v, columnOrder, isSelected, onSelectVictim, onOpenDetail, onOpenContextMenu } = props;
        const id = String(v.id ?? "");

        const onClick = useCallback(() => {
            onSelectVictim(id);
        }, [id, onSelectVictim]);

        const onDoubleClick = useCallback(() => {
            onOpenDetail(id);
        }, [id, onOpenDetail]);

        const onContextMenu = useCallback(
            (e: MouseEvent<HTMLTableRowElement>) => {
                onOpenContextMenu(e, v, id);
            },
            [id, onOpenContextMenu, v],
        );

        return (
            <VictimRowInner
                victim={v}
                columnOrder={columnOrder}
                isSelected={isSelected}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu}
            />
        );
    },
    (a, b) => a.victim === b.victim && a.isSelected === b.isSelected && a.columnOrder === b.columnOrder && a.onSelectVictim === b.onSelectVictim && a.onOpenDetail === b.onOpenDetail && a.onOpenContextMenu === b.onOpenContextMenu,
);
