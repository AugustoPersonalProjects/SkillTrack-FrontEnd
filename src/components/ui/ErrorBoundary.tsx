import { Component, type ErrorInfo, type ReactNode } from "react";
import Alert from "./Alert";

interface ErrorBoundaryProps {
  message: string;
  children: ReactNode;
}

// Sem isto, uma falha ao baixar ou desenhar uma página deixaria o app inteiro em branco
export default class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <Alert message={{ type: "error", text: this.props.message }} />;
    }
    return this.props.children;
  }
}
