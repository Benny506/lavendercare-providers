import { Icon } from "@iconify/react";

export default function ZeroItems({ zeroText1, zeroText2 }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Icon icon="material-symbols:work-outline" className="w-16 h-16 mb-4 text-primary-700" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                { zeroText1 }
            </h3>
            <p className="text-sm text-gray-500 text-center">
                { zeroText2 }
            </p>
        </div>
    )
}