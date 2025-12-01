import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🔴 ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex items-center justify-center bg-brand-dark text-white p-8">
                    <div className="max-w-2xl glass-panel p-8 rounded-3xl">
                        <h1 className="text-3xl font-bold text-red-400 mb-4">⚠️ Error en la Aplicación</h1>
                        <p className="text-slate-300 mb-4">
                            La aplicación encontró un error. Por favor, revisa la consola para más detalles.
                        </p>
                        <pre className="bg-black/50 p-4 rounded-xl text-sm overflow-auto max-h-96 text-red-300">
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.errorInfo?.componentStack}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary/80 transition-colors"
                        >
                            Recargar Aplicación
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
