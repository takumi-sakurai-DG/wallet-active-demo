import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message ?? "不明なエラー",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #050d1f 0%, #0d1b3e 100%)",
          padding: "24px",
          boxSizing: "border-box",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {/* アイコン */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(230,0,18,0.12)",
            border: "2px solid rgba(230,0,18,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            fontSize: 32,
          }}
        >
          ⚠️
        </div>

        {/* タイトル */}
        <h2
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 900,
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          予期しないエラーが発生しました
        </h2>

        {/* 説明 */}
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 13,
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          アプリの読み込み中に問題が発生しました。<br />
          ページを再読み込みして再度お試しください。
        </p>

        {/* エラー詳細（折りたたみ） */}
        {this.state.errorMessage && (
          <details
            style={{
              width: "100%",
              maxWidth: 320,
              marginBottom: 24,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "8px 12px",
            }}
          >
            <summary
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              エラー詳細を表示
            </summary>
            <pre
              style={{
                color: "rgba(255,100,100,0.7)",
                fontSize: 10,
                marginTop: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {this.state.errorMessage}
            </pre>
          </details>
        )}

        {/* ボタン群 */}
        <div style={{ display: "flex", gap: 12, flexDirection: "column", width: "100%", maxWidth: 280 }}>
          <button
            onClick={this.handleReload}
            style={{
              padding: "14px 24px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #E60012, #ff4444)",
              border: "none",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(230,0,18,0.4)",
              letterSpacing: "0.02em",
            }}
          >
            🔄 ページを再読み込み
          </button>
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            前の画面に戻る
          </button>
        </div>

        {/* フッター */}
        <p
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 10,
            marginTop: 32,
            textAlign: "center",
          }}
        >
          PROTOTYPE DEMO — Wallet active
        </p>
      </div>
    );
  }
}
