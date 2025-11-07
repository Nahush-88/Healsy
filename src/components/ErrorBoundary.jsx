import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || "Something went wrong." };
  }

  componentDidCatch(error, info) {
    // You can also log to a monitoring service here
    // console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMsg: "" });
    // force re-render current route
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Oops, something broke</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{this.state.errorMsg}</p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}