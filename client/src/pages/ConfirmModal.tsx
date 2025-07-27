export function ConfirmModal({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Yes',
    cancelText = 'Cancel',
}: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                <p className="text-sm text-gray-700">{message}</p>
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onCancel}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
