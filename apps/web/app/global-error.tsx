"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, background: "#0a0a12" }}>
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "16px",
                        background: "#0a0a12",
                    }}
                >
                    <div style={{ fontSize: "48px" }}>⚠️</div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>
                        Something went wrong
                    </h2>
                    <p
                        style={{
                            maxWidth: "420px",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "rgba(255,255,255,0.5)",
                            margin: 0,
                        }}
                    >
                        {error?.message || "An unexpected error occurred"}
                    </p>
                    <button
                        onClick={() => {
                            reset();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: "8px",
                            cursor: "pointer",
                            borderRadius: "9999px",
                            border: "1px solid rgba(214,154,255,0.42)",
                            background: "rgba(117,61,255,0.82)",
                            padding: "10px 32px",
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#fff",
                        }}
                    >
                        Reload
                    </button>
                </div>
            </body>
        </html>
    );
}