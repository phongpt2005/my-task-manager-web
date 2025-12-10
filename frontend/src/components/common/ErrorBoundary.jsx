/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a fallback UI
 */

import { Component } from 'react';
import { HiExclamationTriangle, HiRefresh } from 'react-icons/hi2';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error('Error Boundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <HiExclamationTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Đã xảy ra lỗi
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Xin lỗi, đã có sự cố xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="text-left bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 overflow-auto max-h-40">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                            >
                                <HiRefresh className="w-5 h-5" />
                                Thử lại
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Tải lại trang
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
