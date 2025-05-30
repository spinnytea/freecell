import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
	fallback?: ReactNode | null;
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			error
			// Example "componentStack":
			//   in ComponentThatThrows (created by App)
			//   in ErrorBoundary (created by App)
			//   in div (created by App)
			//   in App
			// errorInfo.componentStack,
			// Warning: `captureOwnerStack` is not available in production.
			// (React as any).captureOwnerStack?.()
		);
		void errorInfo;
	}
	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return this.props.fallback ?? this.state.error?.message ?? null;
		}

		return this.props.children;
	}
}
