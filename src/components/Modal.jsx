import { Icon } from "@iconify/react";
import React from "react";
import Image from "./ui/image";

export default function Modal({
    image,
    title,
    description,
    children,
    primaryButton = "",
    primaryButtonFunc=()=>{},
    secondaryButtonFunc=()=>{},
    secondaryButton = "",
    hideFooter = false,
    width = "max-w-md",
    styles = {},
    onClose,
}) {
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 ${styles.overlay || ""}`}
        >
            <div className={`max-h-[70-vh] h-[70vh] min-h-[70vh] overflow-y-auto bg-img rounded-2xl p-4 w-full ${styles.wrapper || "max-w-md shadow-xl relative"}`}>
                <div className={`bg-white rounded-lg shadow-lg p-6 w-full ${width} ${styles.content || ""}`}>
                    {/* Close Icon */}
                    {onClose && (
                        <div className={`${styles.closeIconWrapper || "flex justify-end"}`}>
                            <button
                                onClick={onClose}
                                className={`${styles.closeButton || "text-grey-600 hover:text-grey-800"}`}
                                aria-label="Close modal"
                            >
                                <Icon icon="iconoir:cancel" className={`${styles.closeIcon || "w-7 h-7"}`} />
                            </button>
                        </div>
                    )}

                    {/* Image/Icon */}
                    {image && (
                        <div className={`${styles.imageWrapper || "flex justify-center mb-4"}`}>
                            <Image
                                src={image}
                                alt="icon"
                                className={`${styles.image || "w-20 h-20"}`}
                            />
                        </div>
                    )}

                    {/* Title */}
                    {title && (
                        <h2 className={`${styles.title || "text-lg font-semibold text-center text-grey-800"}`}>
                            {title}
                        </h2>
                    )}

                    {/* Description */}
                    {description && (
                        <p className={`${styles.description || "text-center text-grey-500 mt-2"}`}>
                            {description}
                        </p>
                    )}

                    {/* Body (Children Content) */}
                    <div className={`${styles.body || "mt-4"}`}>
                        {children}
                    </div>

                    {/* Footer Buttons */}
                    {!hideFooter && (
                        <div className={`${styles.footer || "flex justify-center gap-3 mt-6"}`}>
                            {primaryButton && (
                                <button
                                    onClick={primaryButtonFunc}
                                    className={` cursor-pointer ${styles.primaryButton || "px-4 py-2 bg-primary-600 text-white rounded-4xl"}`}
                                >
                                    {primaryButton}
                                </button>
                            )}
                            {secondaryButton && (
                                <button
                                    onClick={secondaryButtonFunc}
                                    className={` cursor-pointer ${styles.secondaryButton || "px-4 py-2 bg-grey-100 text-gray-600 rounded-4xl"}`}
                                >
                                    {secondaryButton}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
